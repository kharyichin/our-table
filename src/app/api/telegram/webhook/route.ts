import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { classifyCapture, extractHashtags, extractUrls, buildMessageLink, splitRecipeHashtags } from "@/lib/telegram/parse";
import { handleCommand } from "@/lib/telegram/commands";
import { createCaptureIfNew, getHouseholdIdForChat } from "@/lib/data/captures";
import { createRecipe } from "@/lib/data/recipes";
import { createGroceryFind } from "@/lib/data/groceryFinds";
import { createHash } from "node:crypto";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { persistTelegramPhoto } from "@/lib/telegram/media";
import { importRecipeFromUrl } from "@/lib/recipeImport";

const KNOWN_COMMANDS = new Set(["/help", "/thisweek", "/ideas", "/shopping", "/memories"]);

interface TelegramUpdate {
  message?: {
    message_id: number;
    date: number;
    chat: { id: number; title?: string; type: string };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
    caption?: string;
    photo?: { file_id: string; file_size?: number }[];
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[telegram] TELEGRAM_WEBHOOK_SECRET is required");
    return NextResponse.json({ ok: false, error: "webhook unavailable" }, { status: 503 });
  }
  const header = req.headers.get("x-telegram-bot-api-secret-token");
  if (header !== secret) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true }); // ignore non-message updates for MVP

  const chatId = message.chat.id;
  const text = message.text ?? message.caption ?? "";
  const senderName = message.from?.username ?? message.from?.first_name ?? null;
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.toLowerCase().replace(/@\w+$/, "");

  // Linking must be handled before household lookup because this group is not
  // connected yet. Only the service role may consume the one-time token.
  if (firstWord === "/link") {
    if (message.chat.type !== "group" && message.chat.type !== "supergroup") {
      await sendTelegramMessage(chatId, "Linking only works inside the household Telegram group.", message.message_id);
      return NextResponse.json({ ok: true });
    }
    const token = words[1]?.trim().toUpperCase();
    if (!token) {
      await sendTelegramMessage(chatId, "That linking command is incomplete. Generate a new one in Household Settings.", message.message_id);
      return NextResponse.json({ ok: true });
    }
    const service = getSupabaseServiceClient();
    if (!service) return NextResponse.json({ ok: false, error: "server configuration incomplete" }, { status: 500 });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data: result, error } = await service.rpc("consume_telegram_link_token", {
      requested_token_hash: tokenHash,
      requested_chat_id: chatId,
      requested_chat_title: message.chat.title ?? "",
    });
    if (error) return NextResponse.json({ ok: false, error: "linking failed" }, { status: 500 });
    const reply = {
      linked: "This Telegram group is now connected to your Our Table household.",
      already_linked: "This group is already connected to that household.",
      chat_taken: "This Telegram group is already connected to another household.",
      household_taken: "That household already has a different Telegram group connected.",
      invalid: "That linking code is invalid or expired. Generate a new one in Household Settings.",
    }[String(result)] ?? "The group could not be connected. Generate a new code and try again.";
    await sendTelegramMessage(chatId, reply, message.message_id);
    return NextResponse.json({ ok: true, linkStatus: result });
  }

  const householdId = await getHouseholdIdForChat(chatId);
  if (!householdId) {
    // Group isn't linked to a household yet — say so once, don't persist anything.
    await sendTelegramMessage(
      chatId,
      "This group isn't connected to an Our Table household yet. Ask a household member to link it from Household Settings in the app."
    );
    return NextResponse.json({ ok: true });
  }

  if (firstWord && KNOWN_COMMANDS.has(firstWord)) {
    const reply = await handleCommand(firstWord, householdId);
    await sendTelegramMessage(chatId, reply, message.message_id);
    return NextResponse.json({ ok: true });
  }

  const urls = extractUrls(text);
  const hashtags = extractHashtags(text);
  const imageUrls: string[] = [];
  if (message.photo?.length) {
    const largest = message.photo[message.photo.length - 1];
    const url = await persistTelegramPhoto({
      householdId,
      chatId,
      messageId: message.message_id,
      fileId: largest.file_id,
      reportedSize: largest.file_size,
    });
    if (url) imageUrls.push(url);
  }

  // Nothing worth capturing (e.g. a bare "thanks" with no media, url, or tag).
  if (!text.trim() && imageUrls.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const messageLink = buildMessageLink(chatId, message.message_id);

  const { capture, isNew } = await createCaptureIfNew({
    householdId,
    telegramChatId: chatId,
    telegramMessageId: message.message_id,
    senderName,
    rawText: text || null,
    urls,
    imageUrls,
    hashtags,
    messageLink,
    status: "needs_review",
  });

  const classification = classifyCapture(text, hashtags, urls);

  if (!isNew && capture.status !== "needs_review") {
    // Telegram redelivered an update we already processed — stay idempotent
    // and don't create a second draft or send a second confirmation.
    return NextResponse.json({ ok: true, capture: capture.id, duplicate: true });
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "server configuration incomplete" }, { status: 500 });
  }

  if (classification.kind === "recipe") {
    const recipeTags = splitRecipeHashtags(hashtags);
    const imported = urls[0] ? await importRecipeFromUrl(urls[0]) : null;
    const recipe = await createRecipe(householdId, {
      title: imported?.title ?? classification.title,
      sourceUrl: urls[0] ?? null,
      description: imported?.description ?? (messageLink ? "Captured from Telegram." : null),
      ingredients: imported?.ingredients ?? [],
      instructions: imported?.instructions ?? null,
      cuisineTags: recipeTags.cuisineTags,
      ingredientTags: recipeTags.ingredientTags,
      status: "idea",
      discoveredDate: new Date().toISOString().slice(0, 10),
    }, service);
    await updateCaptureLink(capture.id, recipe.id, null);
    const confidenceNote = classification.confidence === "medium" ? " (double-check the title!)" : "";
    await sendTelegramMessage(
      chatId,
      `Saved as a recipe idea: <b>${escapeHtml(recipe.title)}</b>${confidenceNote}\nStatus: Idea\n${appUrl(`/recipes/${recipe.id}`)}`,
      message.message_id
    );
  } else if (classification.kind === "grocery") {
    const find = await createGroceryFind(householdId, {
      store: classification.store ?? "Unknown store",
      ingredient: classification.ingredient,
      price: classification.price,
      description: messageLink ? "Captured from Telegram." : null,
      imageUrl: imageUrls[0] ?? null,
      sourceUrl: urls[0] ?? null,
    }, service);
    await updateCaptureLink(capture.id, null, find.id);
    await sendTelegramMessage(
      chatId,
      `Saved as a grocery find: <b>${escapeHtml(find.ingredient)}</b>${find.store !== "Unknown store" ? ` at ${escapeHtml(find.store)}` : ""}\n${appUrl("/finds")}`,
      message.message_id
    );
  } else {
    await sendTelegramMessage(
      chatId,
      "Saved to the inbox for review — I wasn't sure if that's a recipe or a grocery find. Sort it out in the Idea Garden.",
      message.message_id
    );
  }

  return NextResponse.json({ ok: true, capture: capture.id });
}

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function updateCaptureLink(captureId: string, recipeId: string | null, groceryFindId: string | null) {
  const { isSupabaseConfigured } = await import("@/lib/supabase/env");
  if (isSupabaseConfigured()) {
    const { getSupabaseServiceClient } = await import("@/lib/supabase/server");
    const supabase = getSupabaseServiceClient();
    await supabase
      ?.from("captures")
      .update({ status: "linked", linked_recipe_id: recipeId, linked_grocery_find_id: groceryFindId })
      .eq("id", captureId);
    return;
  }
  const { demoStore } = await import("@/lib/data/store");
  const capture = demoStore.captures.find((c) => c.id === captureId);
  if (capture) {
    capture.status = "linked";
    capture.linkedRecipeId = recipeId;
    capture.linkedGroceryFindId = groceryFindId;
  }
}

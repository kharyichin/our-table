/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore, nextId } from "./store";
import type { Capture, CaptureStatus } from "@/lib/types";

function mapRow(row: any): Capture {
  return {
    id: row.id,
    householdId: row.household_id,
    telegramChatId: row.telegram_chat_id,
    telegramMessageId: row.telegram_message_id,
    senderName: row.sender_name,
    rawText: row.raw_text,
    urls: row.urls ?? [],
    imageUrls: row.image_urls ?? [],
    hashtags: row.hashtags ?? [],
    messageLink: row.message_link,
    status: row.status,
    linkedRecipeId: row.linked_recipe_id,
    linkedGroceryFindId: row.linked_grocery_find_id,
    createdAt: row.created_at,
  };
}

export interface CaptureInput {
  householdId: string;
  telegramChatId: number;
  telegramMessageId: number;
  senderName: string | null;
  rawText: string | null;
  urls: string[];
  imageUrls: string[];
  hashtags: string[];
  messageLink: string | null;
  status: CaptureStatus;
  linkedRecipeId?: string | null;
  linkedGroceryFindId?: string | null;
}

// Idempotent by (telegram_chat_id, telegram_message_id): Telegram (and our
// own retry logic) may deliver the same update more than once. Returns the
// existing capture, untouched, if we've already recorded this message.
export async function createCaptureIfNew(input: CaptureInput): Promise<{ capture: Capture; isNew: boolean }> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServiceClient() ?? (await getSupabaseServerClient());
    const { data: existing } = await supabase!
      .from("captures")
      .select("*")
      .eq("telegram_chat_id", input.telegramChatId)
      .eq("telegram_message_id", input.telegramMessageId)
      .maybeSingle();
    if (existing) return { capture: mapRow(existing), isNew: false };

    const { data, error } = await supabase!
      .from("captures")
      .insert({
        household_id: input.householdId,
        telegram_chat_id: input.telegramChatId,
        telegram_message_id: input.telegramMessageId,
        sender_name: input.senderName,
        raw_text: input.rawText,
        urls: input.urls,
        image_urls: input.imageUrls,
        hashtags: input.hashtags,
        message_link: input.messageLink,
        status: input.status,
        linked_recipe_id: input.linkedRecipeId ?? null,
        linked_grocery_find_id: input.linkedGroceryFindId ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { capture: mapRow(data), isNew: true };
  }

  const existing = demoStore.captures.find(
    (c) => c.telegramChatId === input.telegramChatId && c.telegramMessageId === input.telegramMessageId
  );
  if (existing) return { capture: existing, isNew: false };

  const capture: Capture = {
    id: nextId("cap"),
    householdId: input.householdId,
    telegramChatId: input.telegramChatId,
    telegramMessageId: input.telegramMessageId,
    senderName: input.senderName,
    rawText: input.rawText,
    urls: input.urls,
    imageUrls: input.imageUrls,
    hashtags: input.hashtags,
    messageLink: input.messageLink,
    status: input.status,
    linkedRecipeId: input.linkedRecipeId ?? null,
    linkedGroceryFindId: input.linkedGroceryFindId ?? null,
    createdAt: new Date().toISOString(),
  };
  demoStore.captures.unshift(capture);
  return { capture, isNew: true };
}

export async function getHouseholdIdForChat(telegramChatId: number): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServiceClient() ?? (await getSupabaseServerClient());
    const { data } = await supabase!
      .from("telegram_links")
      .select("household_id")
      .eq("telegram_chat_id", telegramChatId)
      .maybeSingle();
    return data?.household_id ?? null;
  }
  // Demo mode: any chat resolves to the single demo household so the
  // webhook can be exercised end-to-end without real linking.
  return demoStore.households[0]?.id ?? null;
}

export async function listNeedsReviewCaptures(householdId: string): Promise<Capture[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("captures")
      .select("*")
      .eq("household_id", householdId)
      .eq("status", "needs_review")
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapRow);
  }
  return demoStore.captures.filter((c) => c.householdId === householdId && c.status === "needs_review");
}

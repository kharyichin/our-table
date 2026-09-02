"use server";

import { revalidatePath } from "next/cache";
import { createRecipe } from "@/lib/data/recipes";
import { createGroceryFind } from "@/lib/data/groceryFinds";
import { getDemoHouseholdId } from "@/lib/data/household";
import { demoStore } from "@/lib/data/store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { createCaptureIfNew } from "@/lib/data/captures";
import { classifyCapture, extractHashtags, extractUrls, splitRecipeHashtags } from "@/lib/telegram/parse";

// Turn an ambiguous Telegram capture into a recipe idea or grocery find from
// inside the app's inbox, or dismiss it.
export async function resolveCaptureAction(
  captureId: string,
  decision: "recipe" | "grocery" | "dismiss",
  overrideTitle?: string,
  cuisineTagsText?: string,
  ingredientTagsText?: string,
  overrideStore?: string,
  overridePrice?: number | null
) {
  const householdId = await getDemoHouseholdId();

  const serviceClient = isSupabaseConfigured() ? getSupabaseServiceClient() : null;
  if (serviceClient) {
    const supabase = serviceClient;
    const { data: capture } = await supabase.from("captures").select("*").eq("id", captureId).maybeSingle();
    if (!capture) return;

    if (decision === "dismiss") {
      await supabase.from("captures").update({ status: "dismissed" }).eq("id", captureId);
    } else if (decision === "recipe") {
      const inferred = splitRecipeHashtags(capture.hashtags ?? []);
      const recipe = await createRecipe(householdId, {
        title: overrideTitle || capture.raw_text?.slice(0, 60) || "Untitled idea",
        sourceUrl: capture.urls?.[0] ?? null,
        cuisineTags: parseTags(cuisineTagsText) ?? inferred.cuisineTags,
        ingredientTags: parseTags(ingredientTagsText) ?? inferred.ingredientTags,
        status: "idea",
      });
      await supabase
        .from("captures")
        .update({ status: "linked", linked_recipe_id: recipe.id })
        .eq("id", captureId);
    } else {
      const find = await createGroceryFind(householdId, {
        store: overrideStore || "Unknown store",
        ingredient: overrideTitle || capture.raw_text?.slice(0, 60) || "Grocery find",
        price: overridePrice ?? null,
        imageUrl: capture.image_urls?.[0] ?? null,
        sourceUrl: capture.urls?.[0] ?? null,
      });
      await supabase
        .from("captures")
        .update({ status: "linked", linked_grocery_find_id: find.id })
        .eq("id", captureId);
    }
  } else {
    const capture = demoStore.captures.find((c) => c.id === captureId);
    if (!capture) return;

    if (decision === "dismiss") {
      capture.status = "dismissed";
    } else if (decision === "recipe") {
      const inferred = splitRecipeHashtags(capture.hashtags);
      const recipe = await createRecipe(householdId, {
        title: overrideTitle || capture.rawText?.slice(0, 60) || "Untitled idea",
        sourceUrl: capture.urls[0] ?? null,
        cuisineTags: parseTags(cuisineTagsText) ?? inferred.cuisineTags,
        ingredientTags: parseTags(ingredientTagsText) ?? inferred.ingredientTags,
        status: "idea",
      });
      capture.status = "linked";
      capture.linkedRecipeId = recipe.id;
    } else {
      const find = await createGroceryFind(householdId, {
        store: overrideStore || "Unknown store",
        ingredient: overrideTitle || capture.rawText?.slice(0, 60) || "Grocery find",
        price: overridePrice ?? null,
        imageUrl: capture.imageUrls[0] ?? null,
        sourceUrl: capture.urls[0] ?? null,
      });
      capture.status = "linked";
      capture.linkedGroceryFindId = find.id;
    }
  }

  revalidatePath("/ideas");
}

function parseTags(value?: string): string[] | undefined {
  if (value === undefined) return undefined;
  return value.split(/[,\s]+/).map((tag) => tag.replace(/^#/, "").trim().toLowerCase()).filter(Boolean);
}

export async function submitMockCaptureAction(formData: FormData) {
  const householdId = await getDemoHouseholdId();
  const text = String(formData.get("message") ?? "").trim();
  const senderName = String(formData.get("senderName") ?? "Household member").trim();
  if (!text) throw new Error("Write a message to capture");

  const hashtags = extractHashtags(text);
  const urls = extractUrls(text);
  const classification = classifyCapture(text, hashtags, urls);
  const { capture } = await createCaptureIfNew({
    householdId,
    telegramChatId: -999000,
    telegramMessageId: Date.now(),
    senderName,
    rawText: text,
    urls,
    imageUrls: [],
    hashtags,
    messageLink: null,
    status: "needs_review",
  });

  if (classification.kind === "recipe") {
    const tags = splitRecipeHashtags(hashtags);
    await resolveCaptureAction(capture.id, "recipe", classification.title, tags.cuisineTags.join(","), tags.ingredientTags.join(","));
    revalidatePath("/home");
    return { kind: "recipe" as const, label: classification.title };
  }
  if (classification.kind === "grocery" && classification.confidence === "high") {
    await resolveCaptureAction(capture.id, "grocery", classification.ingredient, undefined, undefined, classification.store ?? undefined, classification.price);
    revalidatePath("/shopping");
    revalidatePath("/finds");
    return { kind: "grocery" as const, label: classification.ingredient };
  }
  revalidatePath("/ideas");
  return { kind: "review" as const, label: "Added to the capture inbox" };
}

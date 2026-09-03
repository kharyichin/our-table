"use server";

import { revalidatePath } from "next/cache";
import { createRecipe, deleteRecipe, updateRecipe, setRecipeStatus, type RecipeInput } from "@/lib/data/recipes";
import { createCookingMemory, type CookingMemoryInput } from "@/lib/data/cookingMemories";
import { getDemoHouseholdId } from "@/lib/data/household";
import type { RecipeStatus, WouldMakeAgain } from "@/lib/types";
import { upsertMealCard } from "@/lib/data/weeklyPlans";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildRecipeInput(formData: FormData): RecipeInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    sourceUrl: (formData.get("sourceUrl") as string) || null,
    description: (formData.get("description") as string) || null,
    ingredients: parseList(formData.get("ingredients")),
    instructions: (formData.get("instructions") as string) || null,
    cuisineTags: parseList(formData.get("cuisineTags")).map((t) => t.replace(/^#/, "").toLowerCase()),
    ingredientTags: parseList(formData.get("ingredientTags")).map((t) => t.replace(/^#/, "").toLowerCase()),
  };
}

export async function createRecipeAction(formData: FormData) {
  const householdId = await getDemoHouseholdId();
  const input = buildRecipeInput(formData);
  if (!input.title) throw new Error("Title is required");
  const recipe = await createRecipe(householdId, {
    ...input,
    status: "idea",
    discoveredDate: new Date().toISOString().slice(0, 10),
    discoveredBy: (formData.get("discoveredBy") as string) || null,
  });
  revalidatePath("/ideas");
  revalidatePath("/home");
  return recipe.id;
}

export async function updateRecipeAction(id: string, formData: FormData) {
  const input = buildRecipeInput(formData);
  if (!input.title) throw new Error("Title is required");
  await updateRecipe(id, input);
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/ideas");
  revalidatePath("/home");
}

export async function deleteRecipeAction(id: string) {
  await deleteRecipe(id);
  revalidatePath("/ideas");
  revalidatePath("/home");
}

export async function changeRecipeStatusAction(id: string, status: RecipeStatus) {
  await setRecipeStatus(id, status);
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/ideas");
}

export async function createMemoryAction(formData: FormData) {
  const householdId = await getDemoHouseholdId();
  const wouldMakeAgain = String(formData.get("wouldMakeAgain") ?? "maybe");
  if (!["yes", "no", "maybe"].includes(wouldMakeAgain)) throw new Error("Choose whether you would make this again");
  const recipeId = String(formData.get("recipeId"));
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const maxBytes = 10 * 1024 * 1024;
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
    };
    const extension = extensions[photo.type];
    if (!extension) throw new Error("Choose a JPEG, PNG, WebP, HEIC, or HEIF photo.");
    if (photo.size > maxBytes) throw new Error("The photo must be smaller than 10 MB.");
    const bytes = await photo.arrayBuffer();
    if (isSupabaseConfigured()) {
      const service = getSupabaseServiceClient();
      if (!service) throw new Error("Photo storage is not configured.");
      const { data: recipe } = await service.from("recipes").select("id").eq("id", recipeId).eq("household_id", householdId).maybeSingle();
      if (!recipe) throw new Error("That recipe does not belong to this household.");
      const objectPath = `${householdId}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await service.storage.from("memory-photos").upload(objectPath, bytes, {
        contentType: photo.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
      photoUrl = `/api/media/memory/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    } else {
      photoUrl = `data:${photo.type};base64,${Buffer.from(bytes).toString("base64")}`;
    }
  }
  const input: CookingMemoryInput = {
    recipeId,
    mealCardId: (formData.get("mealCardId") as string) || null,
    dateCooked: String(formData.get("dateCooked") ?? new Date().toISOString().slice(0, 10)),
    membersPresent: formData.getAll("membersPresent").map(String),
    note: (formData.get("note") as string) || null,
    photoUrl,
    rating: formData.get("rating") ? Number(formData.get("rating")) : null,
    wouldMakeAgain: wouldMakeAgain as WouldMakeAgain,
    changesMade: (formData.get("changesMade") as string) || null,
    occasion: (formData.get("occasion") as string) || null,
  };
  const memory = await createCookingMemory(householdId, input);
  const planId = (formData.get("planId") as string) || null;
  const dayIndexValue = formData.get("dayIndex");
  if (planId && dayIndexValue !== null) {
    await upsertMealCard(planId, Number(dayIndexValue), { state: "cooked" });
    revalidatePath("/week");
    revalidatePath("/shopping");
  }
  revalidatePath(`/recipes/${input.recipeId}`);
  revalidatePath("/memories");
  revalidatePath("/ideas");
  revalidatePath("/home");
  return memory.id;
}

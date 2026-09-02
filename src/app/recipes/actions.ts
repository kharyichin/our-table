"use server";

import { revalidatePath } from "next/cache";
import { createRecipe, deleteRecipe, updateRecipe, setRecipeStatus, type RecipeInput } from "@/lib/data/recipes";
import { createCookingMemory, type CookingMemoryInput } from "@/lib/data/cookingMemories";
import { getDemoHouseholdId } from "@/lib/data/household";
import type { RecipeStatus, WouldMakeAgain } from "@/lib/types";
import { upsertMealCard } from "@/lib/data/weeklyPlans";

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
  const input: CookingMemoryInput = {
    recipeId: String(formData.get("recipeId")),
    mealCardId: (formData.get("mealCardId") as string) || null,
    dateCooked: String(formData.get("dateCooked") ?? new Date().toISOString().slice(0, 10)),
    membersPresent: formData.getAll("membersPresent").map(String),
    note: (formData.get("note") as string) || null,
    photoUrl: (formData.get("photoUrl") as string) || null,
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

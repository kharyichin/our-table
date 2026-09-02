"use server";

import { revalidatePath } from "next/cache";
import { upsertMealCard, clearMealCard, updateChapterTitle, updateWeeklyMemory } from "@/lib/data/weeklyPlans";
import { regenerateShoppingList } from "@/lib/data/shoppingLists";
import { setRecipeStatus } from "@/lib/data/recipes";
import type { MealState } from "@/lib/types";

export async function setMealRecipeAction(planId: string, dayIndex: number, recipeId: string | null) {
  await upsertMealCard(planId, dayIndex, { recipeId, state: recipeId ? "planned" : "planned" });
  if (recipeId) await setRecipeStatus(recipeId, "planned");
  await regenerateShoppingList(planId);
  revalidatePath("/week");
  revalidatePath("/shopping");
  revalidatePath("/home");
}

export async function planRecipeForDayAction(planId: string, recipeId: string, dayIndex: number) {
  await upsertMealCard(planId, dayIndex, { recipeId, state: "planned" });
  await setRecipeStatus(recipeId, "planned");
  await regenerateShoppingList(planId);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/ideas");
  revalidatePath("/week");
  revalidatePath("/shopping");
  revalidatePath("/home");
}

export async function setMealStateAction(planId: string, dayIndex: number, state: MealState) {
  await upsertMealCard(planId, dayIndex, { state });
  await regenerateShoppingList(planId);
  revalidatePath("/week");
  revalidatePath("/shopping");
  revalidatePath("/home");
}

export async function setMealNoteAction(planId: string, dayIndex: number, note: string) {
  await upsertMealCard(planId, dayIndex, { note: note || null });
  revalidatePath("/week");
}

export async function clearMealAction(planId: string, dayIndex: number) {
  await clearMealCard(planId, dayIndex);
  await regenerateShoppingList(planId);
  revalidatePath("/week");
  revalidatePath("/shopping");
}

export async function updateChapterTitleAction(planId: string, title: string) {
  await updateChapterTitle(planId, title);
  revalidatePath("/week");
}

export async function updateWeeklyMemoryAction(planId: string, memory: string) {
  await updateWeeklyMemory(planId, memory.trim() || null);
  revalidatePath("/week");
  revalidatePath("/home");
}

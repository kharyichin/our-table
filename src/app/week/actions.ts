"use server";

import { revalidatePath } from "next/cache";
import { upsertMealCard, clearMealCard, updateChapterTitle, updateWeeklyMemory } from "@/lib/data/weeklyPlans";
import { regenerateShoppingList } from "@/lib/data/shoppingLists";
import { setRecipeStatus } from "@/lib/data/recipes";
import type { MealState } from "@/lib/types";

function validDinerCount(value: number | undefined): number | null {
  if (value === undefined) return null;
  if (!Number.isInteger(value) || value < 1 || value > 50) throw new Error("Choose between 1 and 50 diners.");
  return value;
}

export async function setMealRecipeAction(planId: string, dayIndex: number, recipeId: string | null, dinerCount?: number) {
  await upsertMealCard(planId, dayIndex, { recipeId, state: "planned", ...(recipeId ? { dinerCount: validDinerCount(dinerCount) } : {}) });
  if (recipeId) await setRecipeStatus(recipeId, "planned");
  await regenerateShoppingList(planId);
  revalidatePath("/week");
  revalidatePath("/shopping");
  revalidatePath("/home");
}

export async function planRecipeForDayAction(planId: string, recipeId: string, dayIndex: number, dinerCount?: number) {
  await upsertMealCard(planId, dayIndex, { recipeId, state: "planned", dinerCount: validDinerCount(dinerCount) });
  await setRecipeStatus(recipeId, "planned");
  await regenerateShoppingList(planId);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/ideas");
  revalidatePath("/week");
  revalidatePath("/shopping");
  revalidatePath("/home");
}

export async function setMealDinerCountAction(planId: string, dayIndex: number, dinerCount: number) {
  await upsertMealCard(planId, dayIndex, { dinerCount: validDinerCount(dinerCount) });
  await regenerateShoppingList(planId);
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

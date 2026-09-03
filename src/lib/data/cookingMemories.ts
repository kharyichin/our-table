/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore, nextId } from "./store";
import type { CookingMemory, WouldMakeAgain } from "@/lib/types";
import { setRecipeStatus, getRecipe } from "./recipes";
import { recipeStatusAfterCooking } from "@/lib/recipeStatus";

function mapRow(row: any): CookingMemory {
  return {
    id: row.id,
    householdId: row.household_id,
    recipeId: row.recipe_id,
    mealCardId: row.meal_card_id,
    dateCooked: row.date_cooked,
    membersPresent: row.members_present ?? [],
    photoUrl: row.photo_url,
    note: row.note,
    rating: row.rating,
    wouldMakeAgain: row.would_make_again,
    changesMade: row.changes_made,
    occasion: row.occasion,
    createdAt: row.created_at,
  };
}

export interface CookingMemoryInput {
  recipeId: string;
  mealCardId?: string | null;
  dateCooked: string;
  membersPresent: string[];
  photoUrl?: string | null;
  note?: string | null;
  rating?: number | null;
  wouldMakeAgain: WouldMakeAgain;
  changesMade?: string | null;
  occasion?: string | null;
}

export async function listCookingMemories(householdId: string): Promise<CookingMemory[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("cooking_memories")
      .select("*")
      .eq("household_id", householdId)
      .order("date_cooked", { ascending: false });
    return (data ?? []).map(mapRow);
  }
  return demoStore.cookingMemories
    .filter((m) => m.householdId === householdId)
    .sort((a, b) => (a.dateCooked < b.dateCooked ? 1 : -1));
}

export async function listCookingMemoriesForRecipe(recipeId: string): Promise<CookingMemory[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("cooking_memories")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("date_cooked", { ascending: false });
    return (data ?? []).map(mapRow);
  }
  return demoStore.cookingMemories
    .filter((m) => m.recipeId === recipeId)
    .sort((a, b) => (a.dateCooked < b.dateCooked ? 1 : -1));
}

export async function createCookingMemory(
  householdId: string,
  input: CookingMemoryInput
): Promise<CookingMemory> {
  let memory: CookingMemory;
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase!
      .from("cooking_memories")
      .insert({
        household_id: householdId,
        recipe_id: input.recipeId,
        meal_card_id: input.mealCardId ?? null,
        date_cooked: input.dateCooked,
        members_present: input.membersPresent,
        photo_url: input.photoUrl ?? null,
        note: input.note ?? null,
        rating: input.rating ?? null,
        would_make_again: input.wouldMakeAgain,
        changes_made: input.changesMade ?? null,
        occasion: input.occasion ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    memory = mapRow(data);
  } else {
    memory = {
      id: nextId("cm"),
      householdId,
      recipeId: input.recipeId,
      mealCardId: input.mealCardId ?? null,
      dateCooked: input.dateCooked,
      membersPresent: input.membersPresent,
      photoUrl: input.photoUrl ?? null,
      note: input.note ?? null,
      rating: input.rating ?? null,
      wouldMakeAgain: input.wouldMakeAgain,
      changesMade: input.changesMade ?? null,
      occasion: input.occasion ?? null,
      createdAt: new Date().toISOString(),
    };
    demoStore.cookingMemories.unshift(memory);
  }

  // Recording a memory always means the recipe has now been cooked at least
  // once — promote idea/planned -> cooked, and cooked -> repeated on a second
  // telling, per the product's status model.
  const recipe = await getRecipe(input.recipeId);
  if (recipe) {
    const priorMemories = await listCookingMemoriesForRecipe(input.recipeId);
    const nextStatus = recipeStatusAfterCooking(recipe.status, priorMemories.length);
    if (nextStatus !== recipe.status) await setRecipeStatus(input.recipeId, nextStatus);
  }

  return memory;
}

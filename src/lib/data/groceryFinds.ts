/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { demoStore, nextId } from "./store";
import type { GroceryFind, GroceryFindWithLifecycle } from "@/lib/types";

function mapRow(row: any): GroceryFind {
  return {
    id: row.id,
    householdId: row.household_id,
    store: row.store,
    ingredient: row.ingredient,
    price: row.price !== null ? Number(row.price) : null,
    description: row.description,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    expiryDate: row.expiry_date,
    createdBy: row.created_by,
    createdAt: row.created_at,
    relatedRecipeIds: (row.grocery_find_recipes ?? []).map((r: any) => r.recipe_id),
  };
}

export interface GroceryFindInput {
  store: string;
  ingredient: string;
  price?: number | null;
  description?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  expiryDate?: string | null;
  createdBy?: string | null;
  relatedRecipeIds?: string[];
}

export async function listGroceryFinds(householdId: string): Promise<GroceryFind[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("grocery_finds")
      .select("*, grocery_find_recipes(recipe_id)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapRow);
  }
  return demoStore.groceryFinds
    .filter((g) => g.householdId === householdId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Classify temporary finds without deleting the context that became part of a
 * meal or cooking memory. A recipe relationship becomes historical once that
 * recipe appears on any meal card or cooking memory in the household.
 */
export async function listGroceryFindsWithLifecycle(
  householdId: string,
  referenceDate = new Date().toISOString().slice(0, 10)
): Promise<GroceryFindWithLifecycle[]> {
  const finds = await listGroceryFinds(householdId);
  const historicalRecipeIds = new Set<string>();

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const [{ data: mealRows, error: mealError }, { data: memoryRows, error: memoryError }] = await Promise.all([
      supabase!
        .from("meal_cards")
        .select("recipe_id, weekly_plans!inner(household_id)")
        .eq("weekly_plans.household_id", householdId)
        .not("recipe_id", "is", null),
      supabase!
        .from("cooking_memories")
        .select("recipe_id")
        .eq("household_id", householdId),
    ]);
    if (mealError) throw new Error(mealError.message);
    if (memoryError) throw new Error(memoryError.message);
    for (const row of mealRows ?? []) if (row.recipe_id) historicalRecipeIds.add(row.recipe_id);
    for (const row of memoryRows ?? []) if (row.recipe_id) historicalRecipeIds.add(row.recipe_id);
  } else {
    const householdPlanIds = new Set(
      demoStore.weeklyPlans.filter((plan) => plan.householdId === householdId).map((plan) => plan.id)
    );
    for (const meal of demoStore.mealCards) {
      if (householdPlanIds.has(meal.weeklyPlanId) && meal.recipeId) historicalRecipeIds.add(meal.recipeId);
    }
    for (const memory of demoStore.cookingMemories) {
      if (memory.householdId === householdId) historicalRecipeIds.add(memory.recipeId);
    }
  }

  return finds.map((find) => {
    if (!find.expiryDate || find.expiryDate >= referenceDate) return { ...find, lifecycle: "active" };
    const belongsToHistory = find.relatedRecipeIds.some((recipeId) => historicalRecipeIds.has(recipeId));
    return { ...find, lifecycle: belongsToHistory ? "history" : "expired" };
  });
}

export async function getGroceryFind(id: string): Promise<GroceryFind | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("grocery_finds")
      .select("*, grocery_find_recipes(recipe_id)")
      .eq("id", id)
      .maybeSingle();
    return data ? mapRow(data) : null;
  }
  return demoStore.groceryFinds.find((g) => g.id === id) ?? null;
}

export async function createGroceryFind(
  householdId: string,
  input: GroceryFindInput,
  trustedClient?: SupabaseClient
): Promise<GroceryFind> {
  if (isSupabaseConfigured()) {
    const supabase = trustedClient ?? await getSupabaseServerClient();
    const { data, error } = await supabase!
      .from("grocery_finds")
      .insert({
        household_id: householdId,
        store: input.store,
        ingredient: input.ingredient,
        price: input.price ?? null,
        description: input.description ?? null,
        source_url: input.sourceUrl ?? null,
        image_url: input.imageUrl ?? null,
        expiry_date: input.expiryDate ?? null,
        created_by: input.createdBy ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    if (input.relatedRecipeIds?.length) {
      await supabase!.from("grocery_find_recipes").insert(
        input.relatedRecipeIds.map((recipeId) => ({ grocery_find_id: data.id, recipe_id: recipeId }))
      );
    }
    return mapRow({ ...data, grocery_find_recipes: (input.relatedRecipeIds ?? []).map((id) => ({ recipe_id: id })) });
  }

  const find: GroceryFind = {
    id: nextId("g"),
    householdId,
    store: input.store,
    ingredient: input.ingredient,
    price: input.price ?? null,
    description: input.description ?? null,
    sourceUrl: input.sourceUrl ?? null,
    imageUrl: input.imageUrl ?? null,
    expiryDate: input.expiryDate ?? null,
    createdBy: input.createdBy ?? null,
    createdAt: new Date().toISOString(),
    relatedRecipeIds: input.relatedRecipeIds ?? [],
  };
  demoStore.groceryFinds.unshift(find);
  return find;
}

export async function deleteGroceryFind(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("grocery_finds").delete().eq("id", id);
    return;
  }
  const idx = demoStore.groceryFinds.findIndex((g) => g.id === id);
  if (idx >= 0) demoStore.groceryFinds.splice(idx, 1);
}

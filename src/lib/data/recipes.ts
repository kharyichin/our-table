/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { demoStore, nextId } from "./store";
import type { Recipe, RecipeStatus } from "@/lib/types";

function mapRow(row: any): Recipe {
  return {
    id: row.id,
    householdId: row.household_id,
    title: row.title,
    sourceUrl: row.source_url,
    description: row.description,
    servings: row.servings ?? null,
    ingredients: row.ingredients ?? [],
    instructions: row.instructions,
    cuisineTags: row.cuisine_tags ?? [],
    ingredientTags: row.ingredient_tags ?? [],
    illustrationSeed: row.illustration_seed,
    status: row.status,
    discoveredDate: row.discovered_date,
    discoveredBy: row.discovered_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface RecipeInput {
  title: string;
  sourceUrl?: string | null;
  description?: string | null;
  servings?: string | null;
  ingredients?: string[];
  instructions?: string | null;
  cuisineTags?: string[];
  ingredientTags?: string[];
  status?: RecipeStatus;
  discoveredDate?: string;
  discoveredBy?: string | null;
}

export async function listRecipes(householdId: string): Promise<Recipe[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("recipes")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapRow);
  }
  return demoStore.recipes
    .filter((r) => r.householdId === householdId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!.from("recipes").select("*").eq("id", id).maybeSingle();
    return data ? mapRow(data) : null;
  }
  return demoStore.recipes.find((r) => r.id === id) ?? null;
}

export async function createRecipe(
  householdId: string,
  input: RecipeInput,
  trustedClient?: SupabaseClient
): Promise<Recipe> {
  const illustrationSeed = `${input.title}-${Date.now()}`;
  if (isSupabaseConfigured()) {
    const supabase = trustedClient ?? await getSupabaseServerClient();
    const { data, error } = await supabase!
      .from("recipes")
      .insert({
        household_id: householdId,
        title: input.title,
        source_url: input.sourceUrl ?? null,
        description: input.description ?? null,
        servings: input.servings ?? null,
        ingredients: input.ingredients ?? [],
        instructions: input.instructions ?? null,
        cuisine_tags: input.cuisineTags ?? [],
        ingredient_tags: input.ingredientTags ?? [],
        illustration_seed: illustrationSeed,
        status: input.status ?? "idea",
        discovered_date: input.discoveredDate ?? new Date().toISOString().slice(0, 10),
        discovered_by: input.discoveredBy ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data);
  }

  const now = new Date().toISOString();
  const recipe: Recipe = {
    id: nextId("r"),
    householdId,
    title: input.title,
    sourceUrl: input.sourceUrl ?? null,
    description: input.description ?? null,
    servings: input.servings ?? null,
    ingredients: input.ingredients ?? [],
    instructions: input.instructions ?? null,
    cuisineTags: input.cuisineTags ?? [],
    ingredientTags: input.ingredientTags ?? [],
    illustrationSeed,
    status: input.status ?? "idea",
    discoveredDate: input.discoveredDate ?? now.slice(0, 10),
    discoveredBy: input.discoveredBy ?? null,
    createdAt: now,
    updatedAt: now,
  };
  demoStore.recipes.unshift(recipe);
  return recipe;
}

export async function updateRecipe(id: string, input: Partial<RecipeInput>): Promise<Recipe | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.sourceUrl !== undefined) patch.source_url = input.sourceUrl;
    if (input.description !== undefined) patch.description = input.description;
    if (input.servings !== undefined) patch.servings = input.servings;
    if (input.ingredients !== undefined) patch.ingredients = input.ingredients;
    if (input.instructions !== undefined) patch.instructions = input.instructions;
    if (input.cuisineTags !== undefined) patch.cuisine_tags = input.cuisineTags;
    if (input.ingredientTags !== undefined) patch.ingredient_tags = input.ingredientTags;
    if (input.status !== undefined) patch.status = input.status;
    if (input.discoveredDate !== undefined) patch.discovered_date = input.discoveredDate;
    const { data } = await supabase!.from("recipes").update(patch).eq("id", id).select("*").maybeSingle();
    return data ? mapRow(data) : null;
  }

  const recipe = demoStore.recipes.find((r) => r.id === id);
  if (!recipe) return null;
  Object.assign(recipe, input, { updatedAt: new Date().toISOString() });
  return recipe;
}

export async function setRecipeStatus(id: string, status: RecipeStatus): Promise<void> {
  await updateRecipe(id, { status });
}

export async function deleteRecipe(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("recipes").delete().eq("id", id);
    return;
  }
  const idx = demoStore.recipes.findIndex((r) => r.id === id);
  if (idx >= 0) demoStore.recipes.splice(idx, 1);
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore, nextId } from "./store";
import type { ShoppingItem, ShoppingList } from "@/lib/types";
import { listMealCards } from "./weeklyPlans";
import { getRecipe } from "./recipes";
import { mergeIngredientQuantities, normalizeIngredientKey, parseIngredientLine } from "@/lib/ingredients";

function mapListRow(row: any): ShoppingList {
  return { id: row.id, weeklyPlanId: row.weekly_plan_id, generatedAt: row.generated_at };
}

function mapItemRow(row: any): ShoppingItem {
  return {
    id: row.id,
    shoppingListId: row.shopping_list_id,
    name: row.name,
    quantity: row.quantity,
    category: row.category,
    store: row.store,
    haveIt: row.have_it,
    checked: row.checked,
    substitution: row.substitution,
    sourceMealCardIds: row.source_meal_card_ids ?? [],
    isManual: row.is_manual ?? (row.source_meal_card_ids ?? []).length === 0,
    createdAt: row.created_at,
  };
}

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Produce", ["onion", "garlic", "cabbage", "lime", "lemon", "basil", "cilantro", "carrot", "pea", "green onion", "tomato"]],
  ["Meat", ["chicken", "pork", "beef", "salmon", "fish"]],
  ["Refrigerated", ["tofu", "egg", "cheese", "milk", "cream", "miso", "butter"]],
  ["Frozen", ["frozen"]],
  ["Pantry", ["rice", "pasta", "panko", "curry", "flour", "oil", "vinegar", "sauce", "honey", "sesame", "breadcrumb", "tortilla"]],
];

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Other";
}

export async function getOrCreateShoppingList(planId: string): Promise<ShoppingList> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data: existing } = await supabase!
      .from("shopping_lists")
      .select("*")
      .eq("weekly_plan_id", planId)
      .maybeSingle();
    if (existing) return mapListRow(existing);
    const { data, error } = await supabase!
      .from("shopping_lists")
      .insert({ weekly_plan_id: planId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapListRow(data);
  }

  let list = demoStore.shoppingLists.find((l) => l.weeklyPlanId === planId);
  if (!list) {
    list = { id: nextId("sl"), weeklyPlanId: planId, generatedAt: new Date().toISOString() };
    demoStore.shoppingLists.push(list);
  }
  return list;
}

export async function listShoppingItems(listId: string): Promise<ShoppingItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("shopping_items")
      .select("*")
      .eq("shopping_list_id", listId)
      .order("category", { ascending: true });
    return (data ?? []).map(mapItemRow);
  }
  return demoStore.shoppingItems.filter((i) => i.shoppingListId === listId);
}

// Regenerate items from the recipes currently attached to planned/cooked meal
// cards. Duplicate ingredient names are merged; existing checked/have-it/
// substitution state is preserved for ingredients that survive the refresh.
export async function regenerateShoppingList(planId: string): Promise<ShoppingItem[]> {
  const list = await getOrCreateShoppingList(planId);
  const mealCards = await listMealCards(planId);
  const relevantCards = mealCards.filter(
    (m) => m.recipeId && (m.state === "planned" || m.state === "cooked")
  );

  const merged = new Map<
    string,
    { name: string; quantity: string | null; category: string; sourceMealCardIds: string[] }
  >();

  const recipes = await Promise.all(relevantCards.map((card) => getRecipe(card.recipeId!)));
  for (let cardIndex = 0; cardIndex < relevantCards.length; cardIndex += 1) {
    const card = relevantCards[cardIndex];
    const recipe = recipes[cardIndex];
    if (!recipe) continue;
    for (const rawIngredient of recipe.ingredients) {
      const parsed = parseIngredientLine(rawIngredient);
      if (!parsed?.key) continue;
      const existing = merged.get(parsed.key);
      if (existing) {
        if (!existing.sourceMealCardIds.includes(card.id)) existing.sourceMealCardIds.push(card.id);
        existing.quantity = mergeIngredientQuantities(existing.quantity, parsed.quantity);
      } else {
        merged.set(parsed.key, {
          name: parsed.name,
          quantity: parsed.quantity,
          category: categorize(parsed.name),
          sourceMealCardIds: [card.id],
        });
      }
    }
  }

  const existingItems = await listShoppingItems(list.id);
  const existingByKey = new Map<string, ShoppingItem>();
  for (const item of existingItems) {
    const key = normalizeIngredientKey(item.name);
    const existing = existingByKey.get(key);
    // Prefer the manual row as the durable identity when a previous list has
    // both a household-added and generated version of the same ingredient.
    if (!existing || item.isManual) existingByKey.set(key, item);
  }

  const nextItems: ShoppingItem[] = [];
  for (const [key, entry] of merged) {
    const prior = existingByKey.get(key);
    nextItems.push({
      id: prior?.id ?? nextId("si"),
      shoppingListId: list.id,
      name: entry.name,
      quantity: prior?.isManual ? prior.quantity ?? entry.quantity : entry.quantity,
      category: entry.category,
      store: prior?.store ?? null,
      haveIt: prior?.haveIt ?? false,
      checked: prior?.checked ?? false,
      substitution: prior?.substitution ?? null,
      sourceMealCardIds: entry.sourceMealCardIds,
      isManual: prior?.isManual ?? false,
      createdAt: prior?.createdAt ?? new Date().toISOString(),
    });
  }

  // Household-added items survive even after a matching recipe leaves the
  // plan. Their source links are cleared, but their quantity and checklist
  // state remain household-owned.
  for (const manualItem of existingItems.filter((item) => item.isManual)) {
    if (!nextItems.some((item) => item.id === manualItem.id)) {
      nextItems.push({ ...manualItem, sourceMealCardIds: [] });
    }
  }

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const retainedItems = nextItems.filter((item) => existingIds.has(item.id));
    const newItems = nextItems.filter((item) => !existingIds.has(item.id));
    if (retainedItems.length) {
      const { error: upsertError } = await supabase!.from("shopping_items").upsert(
        retainedItems.map((i) => ({
          id: i.id,
          shopping_list_id: i.shoppingListId,
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          store: i.store,
          have_it: i.haveIt,
          checked: i.checked,
          substitution: i.substitution,
          source_meal_card_ids: i.sourceMealCardIds,
          is_manual: i.isManual,
        })),
        { onConflict: "id" }
      );
      if (upsertError) throw new Error(upsertError.message);
    }
    if (newItems.length) {
      const { error: insertError } = await supabase!.from("shopping_items").insert(
        newItems.map((i) => ({
          shopping_list_id: i.shoppingListId,
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          store: i.store,
          have_it: i.haveIt,
          checked: i.checked,
          substitution: i.substitution,
          source_meal_card_ids: i.sourceMealCardIds,
          is_manual: i.isManual,
        }))
      );
      if (insertError) throw new Error(insertError.message);
    }
    const nextIds = new Set(nextItems.map((item) => item.id));
    const staleGeneratedIds = existingItems
      .filter((item) => !item.isManual && !nextIds.has(item.id))
      .map((item) => item.id);
    if (staleGeneratedIds.length) {
      const { error: deleteError } = await supabase!.from("shopping_items").delete().in("id", staleGeneratedIds);
      if (deleteError) throw new Error(deleteError.message);
    }
    return listShoppingItems(list.id);
  }

  demoStore.shoppingItems = demoStore.shoppingItems
    .filter((i) => i.shoppingListId !== list.id)
    .concat(nextItems);
  return nextItems;
}

export async function updateShoppingItem(
  id: string,
  patch: Partial<Pick<ShoppingItem, "haveIt" | "checked" | "store" | "substitution" | "quantity">>
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const row: Record<string, unknown> = {};
    if (patch.haveIt !== undefined) row.have_it = patch.haveIt;
    if (patch.checked !== undefined) row.checked = patch.checked;
    if (patch.store !== undefined) row.store = patch.store;
    if (patch.substitution !== undefined) row.substitution = patch.substitution;
    if (patch.quantity !== undefined) row.quantity = patch.quantity;
    await supabase!.from("shopping_items").update(row).eq("id", id);
    return;
  }
  const item = demoStore.shoppingItems.find((i) => i.id === id);
  if (item) Object.assign(item, patch);
}

export async function addManualShoppingItem(
  planId: string,
  input: { name: string; quantity?: string | null; store?: string | null }
): Promise<ShoppingItem> {
  const list = await getOrCreateShoppingList(planId);
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase!
      .from("shopping_items")
      .insert({
        shopping_list_id: list.id,
        name: input.name,
        quantity: input.quantity ?? null,
        store: input.store ?? null,
        category: categorize(input.name),
        source_meal_card_ids: [],
        is_manual: true,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapItemRow(data);
  }
  const item: ShoppingItem = {
    id: nextId("si"),
    shoppingListId: list.id,
    name: input.name,
    quantity: input.quantity ?? null,
    category: categorize(input.name),
    store: input.store ?? null,
    haveIt: false,
    checked: false,
    substitution: null,
    sourceMealCardIds: [],
    isManual: true,
    createdAt: new Date().toISOString(),
  };
  demoStore.shoppingItems.push(item);
  return item;
}

// In-memory demo store: a mutable clone of the seed dataset, held in module
// scope so it persists across requests within one server process. This is
// what powers the app when Supabase env vars aren't configured — see
// src/lib/supabase/env.ts#isSupabaseConfigured.
//
// State resets when the dev/prod server restarts. That's an acceptable
// trade-off for an MVP demo mode; real persistence comes from wiring up
// Supabase per the README.

import {
  demoCaptures,
  demoCookingMemories,
  demoGroceryFinds,
  demoHousehold,
  demoMealCards,
  demoMembers,
  demoProfiles,
  demoRecipes,
  demoShoppingItems,
  demoShoppingList,
  demoWeeklyPlan,
} from "@/lib/demo-data";
import type {
  Capture,
  CookingMemory,
  GroceryFind,
  Household,
  HouseholdMember,
  MealCard,
  Profile,
  Recipe,
  ShoppingItem,
  ShoppingList,
  WeeklyPlan,
} from "@/lib/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

interface DemoStore {
  households: Household[];
  members: HouseholdMember[];
  profiles: Profile[];
  recipes: Recipe[];
  groceryFinds: GroceryFind[];
  weeklyPlans: WeeklyPlan[];
  mealCards: MealCard[];
  shoppingLists: ShoppingList[];
  shoppingItems: ShoppingItem[];
  cookingMemories: CookingMemory[];
  captures: Capture[];
}

declare global {
  var __ourTableDemoStore: DemoStore | undefined;
}

function createInitialStore(): DemoStore {
  return {
    households: clone([demoHousehold]),
    members: clone(demoMembers),
    profiles: clone(demoProfiles),
    recipes: clone(demoRecipes),
    groceryFinds: clone(demoGroceryFinds),
    weeklyPlans: clone([demoWeeklyPlan]),
    mealCards: clone(demoMealCards),
    shoppingLists: clone([demoShoppingList]),
    shoppingItems: clone(demoShoppingItems),
    cookingMemories: clone(demoCookingMemories),
    captures: clone(demoCaptures),
  };
}

// Reuse across hot-reloads in dev by stashing on globalThis.
export const demoStore: DemoStore = globalThis.__ourTableDemoStore ?? createInitialStore();
globalThis.__ourTableDemoStore = demoStore;

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

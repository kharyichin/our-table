import type { CookingMemory, Recipe } from "@/lib/types";
import { monthLabel } from "@/lib/utils";

export interface MonthSummary {
  monthKey: string; // YYYY-MM, for sorting
  label: string; // "September 2026"
  mealsCooked: number;
  newRecipeTitles: string[];
  newCuisines: string[];
  newIngredients: string[];
  repeatedFavourites: string[];
  summarySentence: string;
}

function monthKeyOf(dateIso: string): string {
  return dateIso.slice(0, 7);
}

// Deterministic, database-driven monthly digest — no AI involved. Walks the
// timeline oldest to newest so "new this month" only counts things that
// truly appear for the first time in the household's cooking history.
export function computeMonthlySummaries(memories: CookingMemory[], recipes: Recipe[]): MonthSummary[] {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const sorted = [...memories].sort((a, b) => (a.dateCooked < b.dateCooked ? -1 : 1));

  const seenCuisines = new Set<string>();
  const seenIngredients = new Set<string>();
  const seenRecipeIds = new Set<string>();
  const recipeCookCount = new Map<string, number>();

  const byMonth = new Map<string, MonthSummary>();

  for (const memory of sorted) {
    const key = monthKeyOf(memory.dateCooked);
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        monthKey: key,
        label: monthLabel(memory.dateCooked),
        mealsCooked: 0,
        newRecipeTitles: [],
        newCuisines: [],
        newIngredients: [],
        repeatedFavourites: [],
        summarySentence: "",
      });
    }
    const summary = byMonth.get(key)!;
    summary.mealsCooked += 1;

    const recipe = recipeById.get(memory.recipeId);
    if (!recipe) continue;

    const priorCount = recipeCookCount.get(recipe.id) ?? 0;
    recipeCookCount.set(recipe.id, priorCount + 1);

    if (!seenRecipeIds.has(recipe.id)) {
      seenRecipeIds.add(recipe.id);
      summary.newRecipeTitles.push(recipe.title);
      for (const c of recipe.cuisineTags) {
        if (!seenCuisines.has(c)) {
          seenCuisines.add(c);
          summary.newCuisines.push(c);
        }
      }
      for (const ing of recipe.ingredientTags) {
        if (!seenIngredients.has(ing)) {
          seenIngredients.add(ing);
          summary.newIngredients.push(ing);
        }
      }
    }

    // A "repeated favourite" this month: this is at least the 2nd time the
    // household has cooked this recipe, ever.
    if (priorCount >= 1 && !summary.repeatedFavourites.includes(recipe.title)) {
      summary.repeatedFavourites.push(recipe.title);
    }
  }

  for (const summary of byMonth.values()) {
    const parts = [`${summary.mealsCooked} meal${summary.mealsCooked === 1 ? "" : "s"} cooked`];
    if (summary.newRecipeTitles.length > 0) {
      parts.push(`${summary.newRecipeTitles.length} new recipe${summary.newRecipeTitles.length === 1 ? "" : "s"} tried`);
    }
    if (summary.repeatedFavourites.length > 0) {
      parts.push(`${summary.repeatedFavourites.length} household favourite${summary.repeatedFavourites.length === 1 ? "" : "s"}`);
    }
    summary.summarySentence = `${summary.label}: ${parts.join(", ")}.`;
  }

  return Array.from(byMonth.values()).sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
}

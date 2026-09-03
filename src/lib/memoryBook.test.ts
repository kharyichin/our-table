import { describe, expect, it } from "vitest";
import { computeMonthlySummaries } from "@/lib/memoryBook";
import type { CookingMemory, Recipe } from "@/lib/types";

function recipe(id: string, title: string, cuisineTags: string[], ingredientTags: string[]): Recipe {
  return {
    id,
    householdId: "household-1",
    title,
    sourceUrl: null,
    description: null,
    ingredients: [],
    instructions: null,
    cuisineTags,
    ingredientTags,
    illustrationSeed: id,
    status: "cooked",
    discoveredDate: "2026-01-01",
    discoveredBy: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

function memory(id: string, recipeId: string, dateCooked: string): CookingMemory {
  return {
    id,
    householdId: "household-1",
    recipeId,
    mealCardId: null,
    dateCooked,
    membersPresent: [],
    photoUrl: null,
    note: null,
    rating: null,
    wouldMakeAgain: "yes",
    changesMade: null,
    occasion: null,
    createdAt: `${dateCooked}T20:00:00Z`,
  };
}

describe("Memory Book monthly summaries", () => {
  it("counts first discoveries once and repeated favourites across months", () => {
    const recipes = [recipe("r1", "Miso Salmon", ["japanese"], ["salmon", "miso"])];
    const summaries = computeMonthlySummaries(
      [memory("m3", "r1", "2026-09-02"), memory("m1", "r1", "2026-08-04"), memory("m2", "r1", "2026-08-18")],
      recipes,
    );

    expect(summaries.map((summary) => summary.monthKey)).toEqual(["2026-09", "2026-08"]);
    expect(summaries[1]).toMatchObject({
      mealsCooked: 2,
      newRecipeTitles: ["Miso Salmon"],
      newCuisines: ["japanese"],
      newIngredients: ["salmon", "miso"],
      repeatedFavourites: ["Miso Salmon"],
    });
    expect(summaries[0].newRecipeTitles).toEqual([]);
    expect(summaries[0].repeatedFavourites).toEqual(["Miso Salmon"]);
  });

  it("still counts memories whose recipe was removed", () => {
    const [summary] = computeMonthlySummaries([memory("m1", "missing", "2026-09-02")], []);
    expect(summary.mealsCooked).toBe(1);
    expect(summary.summarySentence).toContain("1 meal cooked");
  });
});

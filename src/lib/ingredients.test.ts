import { describe, expect, it } from "vitest";
import { mergeIngredientQuantities, normalizeIngredientKey, parseIngredientLine, parseIngredientText, parseServingCount, scaleIngredientLine } from "@/lib/ingredients";

describe("ingredient parsing", () => {
  it("normalizes preparation words and plural forms", () => {
    expect(normalizeIngredientKey("Fresh chopped Tomatoes")).toBe("tomato");
    expect(normalizeIngredientKey("Boneless skinless chicken thighs")).toBe("chicken thigh");
  });

  it("separates quantities and canonical units", () => {
    expect(parseIngredientLine("2 tablespoons olive oil")).toEqual({
      name: "olive oil",
      quantity: "2 tbsp",
      key: "olive oil",
    });
    expect(parseIngredientLine("½ cup diced onions")).toEqual({
      name: "diced onions",
      quantity: "1/2 cup",
      key: "onion",
    });
  });

  it("keeps count nouns in the ingredient name", () => {
    expect(parseIngredientLine("2 chicken thighs")).toMatchObject({ name: "chicken thighs", quantity: "2" });
  });

  it("adds compatible quantities and preserves incompatible ones", () => {
    expect(mergeIngredientQuantities("1 cup", "1/2 cup")).toBe("1.5 cup");
    expect(mergeIngredientQuantities("2 lb", "8 oz")).toBe("2 lb + 8 oz");
    expect(mergeIngredientQuantities("1 bunch", "1 bunch")).toBe("1 bunch");
  });

  it("keeps commas inside a single ingredient", () => {
    expect(parseIngredientText("½ onion (4 oz, 113 g; peeled)\n10 oz boneless, skinless chicken thighs")).toEqual([
      "½ onion (4 oz, 113 g; peeled)",
      "10 oz boneless, skinless chicken thighs",
    ]);
  });

  it("reads simple recipe yields", () => {
    expect(parseServingCount("Serves 4")).toBe(4);
    expect(parseServingCount("2 servings")).toBe(2);
    expect(parseServingCount("4-6 servings")).toBeNull();
  });

  it("scales only safe leading quantities", () => {
    expect(scaleIngredientLine("2 chicken thighs", 0.5)).toBe("1 chicken thighs");
    expect(scaleIngredientLine("½ cup rice", 2)).toBe("1 cup rice");
    expect(scaleIngredientLine("1 can (14 oz) tomatoes", 2)).toBe("1 can (14 oz) tomatoes");
    expect(scaleIngredientLine("Salt to taste", 2)).toBe("Salt to taste");
  });
});

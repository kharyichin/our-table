import { describe, expect, it } from "vitest";
import { mergeIngredientQuantities, normalizeIngredientKey, parseIngredientLine } from "@/lib/ingredients";

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
});

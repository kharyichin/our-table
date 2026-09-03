import { describe, expect, it } from "vitest";
import { extractRecipeFromHtml } from "./recipeImport";

describe("extractRecipeFromHtml", () => {
  it("extracts a Recipe from a schema.org graph", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@graph": [{ "@type": "WebPage" }, {
        "@type": ["Recipe", "NewsArticle"],
        name: "Oyakodon",
        description: "Chicken and egg rice bowl",
        recipeIngredient: ["2 chicken thighs", "3 eggs"],
        recipeInstructions: [{ "@type": "HowToStep", text: "Simmer the chicken." }, { "@type": "HowToStep", text: "Add the eggs." }],
      }],
    })}</script>`;
    expect(extractRecipeFromHtml(html)).toEqual({
      title: "Oyakodon",
      description: "Chicken and egg rice bowl",
      ingredients: ["2 chicken thighs", "3 eggs"],
      instructions: "1. Simmer the chicken.\n\n2. Add the eggs.",
    });
  });

  it("returns null when the page has no usable recipe metadata", () => {
    expect(extractRecipeFromHtml("<html><h1>Dinner</h1></html>")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, extractRecipeFromHtml } from "./recipeImport";

describe("extractRecipeFromHtml", () => {
  it("extracts a Recipe from a schema.org graph", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@graph": [{ "@type": "WebPage" }, {
        "@type": ["Recipe", "NewsArticle"],
        name: "Nami&#39;s Oyakodon",
        description: "Chicken &amp; egg rice bowl",
        recipeYield: "2 servings",
        image: { url: "https://example.com/oyakodon.jpg" },
        recipeIngredient: ["2 chicken thighs", "3 eggs"],
        recipeInstructions: [{ "@type": "HowToStep", text: "Simmer the chicken." }, { "@type": "HowToStep", text: "Add the eggs." }],
      }],
    })}</script>`;
    expect(extractRecipeFromHtml(html)).toEqual({
      title: "Nami's Oyakodon",
      description: "Chicken & egg rice bowl",
      servings: "2 servings",
      imageUrl: "https://example.com/oyakodon.jpg",
      ingredients: ["2 chicken thighs", "3 eggs"],
      instructions: "1. Simmer the chicken.\n\n2. Add the eggs.",
    });
  });

  it("returns null when the page has no usable recipe metadata", () => {
    expect(extractRecipeFromHtml("<html><h1>Dinner</h1></html>")).toBeNull();
  });

  it("decodes numeric and double-encoded entities", () => {
    expect(decodeHtmlEntities("Nami&#39;s Tip: ½ cup&amp;#32;dashi")).toBe("Nami's Tip: ½ cup dashi");
  });
});

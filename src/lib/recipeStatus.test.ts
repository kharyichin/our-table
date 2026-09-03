import { describe, expect, it } from "vitest";
import { recipeStatusAfterCooking } from "@/lib/recipeStatus";

describe("recipe cooking transitions", () => {
  it.each(["idea", "planned", "cooked"] as const)("promotes %s to cooked after its first memory", (status) => {
    expect(recipeStatusAfterCooking(status, 1)).toBe("cooked");
  });

  it("promotes a recipe to repeated after another cooking memory", () => {
    expect(recipeStatusAfterCooking("cooked", 2)).toBe("repeated");
  });

  it("never revives an archived recipe", () => {
    expect(recipeStatusAfterCooking("archived", 4)).toBe("archived");
  });
});

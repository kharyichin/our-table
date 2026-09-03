import type { RecipeStatus } from "@/lib/types";

export function recipeStatusAfterCooking(current: RecipeStatus, totalMemoryCount: number): RecipeStatus {
  if (current === "archived") return "archived";
  return totalMemoryCount > 1 ? "repeated" : "cooked";
}

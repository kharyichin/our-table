import { getDemoHouseholdId } from "@/lib/data/household";
import { listRecipes } from "@/lib/data/recipes";
import { listGroceryFindsWithLifecycle } from "@/lib/data/groceryFinds";
import { GroceryFindsClient } from "@/components/shopping/GroceryFindsClient";
import { LinkButton } from "@/components/ui/Button";

export default async function GroceryFindsPage() {
  const householdId = await getDemoHouseholdId();
  const [recipes, groceryFinds] = await Promise.all([listRecipes(householdId), listGroceryFindsWithLifecycle(householdId)]);
  const today = new Date().toISOString().slice(0, 10);
  const activeFinds = groceryFinds.filter((find) => find.lifecycle === "active");
  const historicalFinds = groceryFinds.filter((find) => find.lifecycle === "history");
  const expiredCount = groceryFinds.filter((find) => find.lifecycle === "expired").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-10 lg:py-12">
      <header className="chapter-masthead mb-9 border-b border-line pb-7">
        <p className="chapter-kicker">Clipped from the market</p>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Grocery finds</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">Deals, seasonal ingredients, and little discoveries worth considering before the week takes shape.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <LinkButton href="/week" size="sm">Plan with these finds</LinkButton>
          <LinkButton href="/shopping" variant="secondary" size="sm">Open the shopping list</LinkButton>
        </div>
      </header>

      <GroceryFindsClient finds={activeFinds} historicalFinds={historicalFinds} recipes={recipes.filter((recipe) => recipe.status !== "archived")} today={today} />
      {expiredCount > 0 && (
        <p className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">{expiredCount} expired {expiredCount === 1 ? "find is" : "finds are"} tucked away because {expiredCount === 1 ? "it was not" : "they were not"} connected to a meal.</p>
      )}
    </div>
  );
}

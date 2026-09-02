import { getDemoHouseholdId } from "@/lib/data/household";
import { listRecipes } from "@/lib/data/recipes";
import { getOrCreateCurrentWeeklyPlan, listMealCards } from "@/lib/data/weeklyPlans";
import { getOrCreateShoppingList, listShoppingItems, regenerateShoppingList } from "@/lib/data/shoppingLists";
import { ShoppingListClient } from "@/components/shopping/ShoppingListClient";
import { LinkButton } from "@/components/ui/Button";

export default async function ShoppingPage() {
  const householdId = await getDemoHouseholdId();
  const plan = await getOrCreateCurrentWeeklyPlan(householdId);
  const list = await getOrCreateShoppingList(plan.id);
  let items = await listShoppingItems(list.id);
  if (items.length === 0) {
    items = await regenerateShoppingList(plan.id);
  }
  const [mealCards, recipes] = await Promise.all([
    listMealCards(plan.id),
    listRecipes(householdId),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="chapter-masthead mb-8">
        <p className="chapter-kicker">From the week to the market</p>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">The kitchen list</h1>
        <p className="mt-2 text-sm text-ink-soft">Ingredients from planned meals, plus the little things only someone in the household remembers.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/week" variant="secondary" size="sm">Back to this week</LinkButton>
          <LinkButton href="/finds" variant="ghost" size="sm">Browse grocery finds</LinkButton>
        </div>
      </div>

      <section>
        <h2 className="font-display mb-4 text-xl text-ink">This week&apos;s list</h2>
        <ShoppingListClient planId={plan.id} items={items} mealCards={mealCards} recipes={recipes} />
      </section>
    </div>
  );
}

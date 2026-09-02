import Link from "next/link";
import { getDemoHouseholdId, getHouseholdMembers } from "@/lib/data/household";
import { listRecipes } from "@/lib/data/recipes";
import { listGroceryFindsWithLifecycle } from "@/lib/data/groceryFinds";
import { listCookingMemories } from "@/lib/data/cookingMemories";
import { getOrCreateCurrentWeeklyPlan, listMealCards } from "@/lib/data/weeklyPlans";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";
import { LinkButton } from "@/components/ui/Button";
import { AvatarStack } from "@/components/ui/Avatar";
import { formatMonthDay, timeAgo } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/types";
import { LineIcon } from "@/components/ui/LineIcon";

export default async function HomePage() {
  const householdId = await getDemoHouseholdId();
  const [members, recipes, groceryFinds, memories, plan] = await Promise.all([
    getHouseholdMembers(householdId),
    listRecipes(householdId),
    listGroceryFindsWithLifecycle(householdId),
    listCookingMemories(householdId),
    getOrCreateCurrentWeeklyPlan(householdId),
  ]);
  const mealCards = await listMealCards(plan.id);
  const ideas = recipes.filter((r) => r.status === "idea").slice(0, 3);
  const soonExpiring = groceryFinds
    .filter((g) => g.lifecycle === "active" && g.expiryDate)
    .sort((a, b) => (a.expiryDate! < b.expiryDate! ? -1 : 1))
    .slice(0, 3);
  const latestMemory = memories[0];
  const todayIndex = ((new Date().getDay() + 6) % 7); // 0 = Monday
  const todayCard = mealCards.find((c) => c.dayIndex === todayIndex);
  const todayRecipe = todayCard?.recipeId ? recipes.find((r) => r.id === todayCard.recipeId) : null;

  return (
    <div className="home-journal mx-auto max-w-5xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="home-masthead mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="journal-kicker">The household food journal</p>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">What’s cooking?</h1>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">Ideas we’re saving, meals we’re planning, and the stories we’re keeping.</p>
        </div>
        <AvatarStack members={members.map((m) => ({ avatarUrl: m.profile?.avatarUrl, name: m.profile?.displayName ?? "" }))} />
      </div>

      {/* Today card */}
      <section className="paper-card paper-stack wobble-1 mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-tomato-dark">
            {DAY_LABELS[todayIndex]} · Today
          </p>
          {todayRecipe ? (
            <>
              <h2 className="font-display mt-1 text-2xl text-ink">{todayRecipe.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{todayCard?.state === "cooked" ? "Already cooked today" : "On tonight's table"}</p>
            </>
          ) : todayCard?.state === "eating_out" ? (
            <h2 className="font-display mt-1 text-2xl text-ink">Eating out tonight</h2>
          ) : todayCard?.state === "skipped" ? (
            <h2 className="font-display mt-1 text-2xl text-ink">Nothing planned — skipping tonight</h2>
          ) : (
            <h2 className="font-display mt-1 text-2xl text-ink">Nothing on the calendar yet</h2>
          )}
          <LinkButton href="/week" variant="secondary" size="sm" className="mt-3">
            Open this week&apos;s story →
          </LinkButton>
        </div>
        {todayRecipe && (
          <DishIllustration seed={todayRecipe.illustrationSeed} tags={[...todayRecipe.ingredientTags, ...todayRecipe.cuisineTags]} className="h-28 w-28 shrink-0" />
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Fresh ideas */}
        <section className="paper-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="section-title"><LineIcon name="sprout" /> Fresh ideas</h3>
            <Link href="/ideas" className="text-xs font-semibold text-tomato-dark hover:underline">
              See garden
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {ideas.map((r) => (
              <li key={r.id}>
                <Link href={`/recipes/${r.id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-paper-warm/60">
                  <DishIllustration seed={r.illustrationSeed} tags={[...r.ingredientTags, ...r.cuisineTags]} className="h-12 w-12 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{r.title}</p>
                    <p className="text-xs text-ink-soft">Discovered {timeAgo(r.discoveredDate)}</p>
                  </div>
                </Link>
              </li>
            ))}
            {ideas.length === 0 && <p className="text-sm text-ink-soft">No ideas yet — the garden is waiting to be planted.</p>}
          </ul>
        </section>

        {/* Grocery finds */}
        <section className="paper-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="section-title"><LineIcon name="basket" /> Worth grabbing</h3>
            <Link href="/finds" className="text-xs font-semibold text-tomato-dark hover:underline">
              See finds
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {soonExpiring.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2 rounded-xl p-1.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{g.ingredient}</p>
                  <p className="text-xs text-ink-soft">{g.store}{g.expiryDate ? ` · use by ${formatMonthDay(g.expiryDate)}` : ""}</p>
                </div>
                {g.price != null && <span className="shrink-0 text-sm font-semibold text-basil-dark">${g.price.toFixed(2)}</span>}
              </li>
            ))}
            {soonExpiring.length === 0 && <p className="text-sm text-ink-soft">No grocery finds logged yet.</p>}
          </ul>
        </section>
      </div>

      {/* Latest memory */}
      {latestMemory && (
        <section className="paper-card wobble-2 mt-6 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="section-title"><LineIcon name="memory" /> Latest memory</h3>
            <Link href="/memories" className="text-xs font-semibold text-tomato-dark hover:underline">
              Memory Book
            </Link>
          </div>
          <p className="text-sm text-ink-soft italic">&quot;{latestMemory.note}&quot;</p>
          <p className="mt-2 text-xs text-ink-soft">{formatMonthDay(latestMemory.dateCooked)}</p>
        </section>
      )}
    </div>
  );
}

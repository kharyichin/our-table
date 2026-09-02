import { getDemoHouseholdId, getHouseholdMembers } from "@/lib/data/household";
import { listRecipes } from "@/lib/data/recipes";
import { listGroceryFinds } from "@/lib/data/groceryFinds";
import { getOrCreateWeeklyPlanForDate, listMealCards } from "@/lib/data/weeklyPlans";
import { DayCard } from "@/components/week/DayCard";
import { ChapterTitle } from "@/components/week/ChapterTitle";
import { Tag } from "@/components/ui/Tag";
import { formatMonthDay } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/types";
import { WeekNavigator } from "@/components/week/WeekNavigator";
import { WeeklyMemory } from "@/components/week/WeeklyMemory";
import { WeekCalendar } from "@/components/week/WeekCalendar";

function currentWeekStart(): string {
  const value = new Date();
  const day = value.getDay();
  value.setDate(value.getDate() + ((day === 0 ? -6 : 1) - day));
  return value.toISOString().slice(0, 10);
}

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ date?: string; view?: string }> }) {
  const householdId = await getDemoHouseholdId();
  const { date, view: requestedView } = await searchParams;
  const view = requestedView === "calendar" ? "calendar" : "story";
  const plan = await getOrCreateWeeklyPlanForDate(householdId, date ?? currentWeekStart());
  const [mealCards, recipes, groceryFinds, members] = await Promise.all([
    listMealCards(plan.id),
    listRecipes(householdId),
    listGroceryFinds(householdId),
    getHouseholdMembers(householdId),
  ]);

  const activeRecipes = recipes.filter((r) => r.status !== "archived");
  const weekStart = new Date(`${plan.weekStartDate}T00:00:00`);
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const plannedRecipeIds = new Set(mealCards.filter((c) => c.recipeId).map((c) => c.recipeId));
  const findsAvailableThisWeek = groceryFinds.filter((g) => {
    const capturedDate = g.createdAt.slice(0, 10);
    return capturedDate <= dayDates[6] && (!g.expiryDate || g.expiryDate >= plan.weekStartDate);
  });
  const relevantFinds = findsAvailableThisWeek.filter(
    (g) => g.relatedRecipeIds.some((id) => plannedRecipeIds.has(id)) || (g.expiryDate && g.expiryDate <= dayDates[6])
  );
  const otherFinds = findsAvailableThisWeek.filter((g) => !relevantFinds.includes(g));
  const hiddenExpiredCount = groceryFinds.length - findsAvailableThisWeek.length;
  const isCurrent = plan.weekStartDate === currentWeekStart();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-10 lg:py-10">
      <header className="chapter-masthead mb-6">
        <WeekNavigator weekStartDate={plan.weekStartDate} isCurrent={isCurrent} view={view} />
        <p className="chapter-kicker mt-5">Week of {formatMonthDay(plan.weekStartDate)} · {isCurrent ? "chapter in progress" : "from the household archive"}</p>
        <ChapterTitle key={plan.id} planId={plan.id} initialTitle={plan.chapterTitle} />
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">Choose what belongs on the table, keep room for plans to change, then save the parts worth remembering.</p>
      </header>

      {view === "calendar" ? (
        <WeekCalendar weekStartDate={plan.weekStartDate} mealCards={mealCards} recipes={activeRecipes} />
      ) : (
      <>
      <div className="weekly-spread grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="mb-4 flex items-end justify-between border-b border-line/80 pb-3">
            <div>
              <p className="chapter-kicker">Seven places at the table</p>
              <h2 className="font-display text-2xl text-ink">This week’s pages</h2>
            </div>
            {isCurrent && <a href="/shopping" className="text-sm font-semibold text-tomato-dark hover:underline">Take the list shopping →</a>}
          </div>
          <div className="week-days-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DAY_LABELS.map((_, i) => (
            <DayCard
              key={`${plan.id}-${i}`}
              planId={plan.id}
              dayIndex={i}
              dateIso={dayDates[i]}
              card={mealCards.find((c) => c.dayIndex === i)}
              recipes={activeRecipes}
              wobble={["wobble-1", "wobble-2", "wobble-3"][i % 3]}
              members={members.map((m) => ({ id: m.profileId, name: m.profile?.displayName ?? "Someone" }))}
            />
          ))}
          </div>
        </section>

        <aside className="grocery-margin xl:sticky xl:top-8 xl:self-start">
          <p className="chapter-kicker">Clipped from the market</p>
          <h2 className="font-display mb-1 text-2xl text-ink">Grocery finds</h2>
          <p className="mb-4 text-sm text-ink-soft">A little inspiration before the list gets practical.</p>
          <a href="/finds" className="mb-4 inline-block text-xs font-semibold text-tomato-dark hover:underline">Open all grocery finds →</a>
          <div className="flex flex-col gap-3">
            {relevantFinds.length === 0 && otherFinds.length === 0 && (
              <p className="text-sm text-ink-soft">No active grocery finds belonged to this week.</p>
            )}
            {relevantFinds.map((g) => (
              <div key={g.id} className="paper-card p-3">
                <p className="text-sm font-semibold text-ink">{g.ingredient}</p>
                <p className="text-xs text-ink-soft">
                  {g.store}
                  {g.expiryDate ? ` · use by ${formatMonthDay(g.expiryDate)}` : ""}
                </p>
                {g.price != null && <p className="mt-1 text-xs font-semibold text-basil-dark">${g.price.toFixed(2)}</p>}
              </div>
            ))}
            {otherFinds.length > 0 && (
              <details className="text-xs text-ink-soft">
                <summary className="cursor-pointer select-none">+{otherFinds.length} more finds</summary>
                <div className="mt-2 flex flex-col gap-2">
                  {otherFinds.map((g) => (
                    <div key={g.id} className="rounded-lg border border-line bg-paper-warm/40 p-2">
                      <Tag variant="neutral">{g.ingredient} · {g.store}</Tag>
                    </div>
                  ))}
                </div>
              </details>
            )}
            {hiddenExpiredCount > 0 && isCurrent && (
              <p className="border-t border-line pt-3 text-xs text-ink-soft">{hiddenExpiredCount} expired {hiddenExpiredCount === 1 ? "find is" : "finds are"} tucked away from active planning.</p>
            )}
          </div>
        </aside>
      </div>
      <WeeklyMemory key={plan.id} planId={plan.id} initialMemory={plan.weeklyMemory} />
      </>
      )}
    </div>
  );
}

import { getDemoHouseholdId, getHouseholdMembers } from "@/lib/data/household";
import { listCookingMemories } from "@/lib/data/cookingMemories";
import { listRecipes } from "@/lib/data/recipes";
import { computeMonthlySummaries } from "@/lib/memoryBook";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { LogMemoryButton } from "@/components/memories/LogMemoryButton";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { MemoryBookFilters } from "@/components/memories/MemoryBookFilters";

export default async function MemoriesPage({ searchParams }: { searchParams: Promise<{ year?: string; cuisine?: string; ingredient?: string; member?: string }> }) {
  const householdId = await getDemoHouseholdId();
  const filters = await searchParams;
  const [allMemories, recipes, members] = await Promise.all([
    listCookingMemories(householdId),
    listRecipes(householdId),
    getHouseholdMembers(householdId),
  ]);
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const profiles = members.map((m) => m.profile).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const years = Array.from(new Set(allMemories.map((memory) => memory.dateCooked.slice(0, 4)))).sort().reverse();
  const cuisines = Array.from(new Set(recipes.flatMap((recipe) => recipe.cuisineTags))).sort();
  const ingredients = Array.from(new Set(recipes.flatMap((recipe) => recipe.ingredientTags))).sort();
  const memories = allMemories.filter((memory) => {
    const recipe = recipeById.get(memory.recipeId);
    if (filters.year && !memory.dateCooked.startsWith(filters.year)) return false;
    if (filters.cuisine && !recipe?.cuisineTags.includes(filters.cuisine)) return false;
    if (filters.ingredient && !recipe?.ingredientTags.includes(filters.ingredient)) return false;
    if (filters.member && !memory.membersPresent.includes(filters.member)) return false;
    return true;
  });
  const monthly = computeMonthlySummaries(memories, recipes);

  const memoriesByMonth = new Map<string, typeof memories>();
  for (const m of memories) {
    const key = m.dateCooked.slice(0, 7);
    if (!memoriesByMonth.has(key)) memoriesByMonth.set(key, []);
    memoriesByMonth.get(key)!.push(m);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="chapter-masthead mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chapter-kicker">The household archive</p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Memory Book</h1>
          <p className="mt-2 text-sm text-ink-soft">Return to a year, a flavour, or the people who shared the table.</p>
        </div>
        <LogMemoryButton
          recipes={recipes}
          members={members.map((m) => ({ id: m.profileId, name: m.profile?.displayName ?? "Someone" }))}
        />
      </div>

      <MemoryBookFilters
        years={years}
        cuisines={cuisines}
        ingredients={ingredients}
        members={profiles.map((profile) => ({ value: profile.id, label: profile.displayName }))}
        selected={filters}
      />

      {monthly.length === 0 ? (
        <EmptyState
          icon="memory"
          title={allMemories.length === 0 ? "The story hasn't started yet" : "No memories match this page"}
          body={allMemories.length === 0 ? "Once you cook something and log the memory, this page fills up with your household's food history." : "Try another year, cuisine, ingredient, or household member."}
        />
      ) : (
        <div className="flex flex-col gap-12">
          {monthly.map((month) => {
            const monthMemories = (memoriesByMonth.get(month.monthKey) ?? []).sort((a, b) =>
              a.dateCooked < b.dateCooked ? 1 : -1
            );
            return (
              <section key={month.monthKey} className="relative">
                <div className="tape -left-2 -top-3 -rotate-6" aria-hidden />
                <div className="paper-card wobble-1 mb-5 p-4">
                  <h2 className="font-display text-xl text-ink">{month.label}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{month.summarySentence}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {month.newCuisines.map((c) => <Tag key={`c-${c}`} variant="cuisine">New · #{c}</Tag>)}
                    {month.newIngredients.map((i) => <Tag key={`i-${i}`} variant="ingredient">New · #{i}</Tag>)}
                    {month.repeatedFavourites.map((title) => (
                      <Tag key={`f-${title}`} variant="neutral">Again · {title}</Tag>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pl-2 sm:pl-6">
                  {monthMemories.map((m, i) => {
                    const recipe = recipeById.get(m.recipeId);
                    return (
                      <MemoryCard
                        key={m.id}
                        memory={m}
                        members={profiles}
                        recipeTitle={recipe?.title}
                        recipeId={recipe?.id}
                        illustrationSeed={recipe?.illustrationSeed}
                        illustrationTags={recipe ? [...recipe.ingredientTags, ...recipe.cuisineTags] : undefined}
                        wobble={["wobble-1", "wobble-2", "wobble-3"][i % 3]}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

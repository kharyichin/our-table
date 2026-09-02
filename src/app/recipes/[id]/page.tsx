import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipe } from "@/lib/data/recipes";
import { listCookingMemoriesForRecipe } from "@/lib/data/cookingMemories";
import { getHouseholdMembers, getProfiles } from "@/lib/data/household";
import { listGroceryFinds } from "@/lib/data/groceryFinds";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { RecipeDetailActions } from "@/components/recipes/RecipeDetailActions";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { formatDate } from "@/lib/utils";
import { getOrCreateCurrentWeeklyPlan } from "@/lib/data/weeklyPlans";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const [memories, members, groceryFinds, currentPlan] = await Promise.all([
    listCookingMemoriesForRecipe(id),
    getHouseholdMembers(recipe.householdId),
    listGroceryFinds(recipe.householdId),
    getOrCreateCurrentWeeklyPlan(recipe.householdId),
  ]);
  const profiles = members.map((m) => m.profile).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const discoveredByProfile = recipe.discoveredBy ? (await getProfiles([recipe.discoveredBy]))[0] : null;
  const relatedFinds = groceryFinds.filter((g) => g.relatedRecipeIds.includes(id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-10 lg:py-12">
      <Link href="/ideas" className="mb-4 inline-block text-sm text-ink-soft hover:underline">
        ← Back to the garden
      </Link>

      <div className="paper-card paper-stack mb-6 flex flex-col gap-5 p-6 sm:flex-row">
        <DishIllustration
          seed={recipe.illustrationSeed}
          tags={[...recipe.ingredientTags, ...recipe.cuisineTags]}
          className="h-28 w-28 shrink-0 self-start"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusPill status={recipe.status} />
          </div>
          <h1 className="font-display text-3xl text-ink">{recipe.title}</h1>
          {recipe.description && <p className="mt-2 text-sm text-ink-soft">{recipe.description}</p>}
          <p className="mt-2 text-xs text-ink-soft">
            Discovered {formatDate(recipe.discoveredDate)}
            {discoveredByProfile ? ` by ${discoveredByProfile.displayName}` : ""}
            {recipe.sourceUrl && (
              <>
                {" · "}
                <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                  original source
                </a>
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.cuisineTags.map((t) => <Tag key={t} variant="cuisine">#{t}</Tag>)}
            {recipe.ingredientTags.map((t) => <Tag key={t} variant="ingredient">#{t}</Tag>)}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <RecipeDetailActions
          recipe={recipe}
          members={members.map((m) => ({ id: m.profileId, name: m.profile?.displayName ?? "Someone" }))}
          planId={currentPlan.id}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="paper-card p-5">
          <h2 className="font-display mb-3 text-lg text-ink">Ingredients</h2>
          {recipe.ingredients.length > 0 ? (
            <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-tomato">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">No ingredients listed yet.</p>
          )}
        </section>

        <section className="paper-card p-5">
          <h2 className="font-display mb-3 text-lg text-ink">Instructions</h2>
          {recipe.instructions ? (
            <p className="whitespace-pre-line text-sm text-ink-soft">{recipe.instructions}</p>
          ) : (
            <p className="text-sm text-ink-soft">No instructions written down yet.</p>
          )}
        </section>
      </div>

      {relatedFinds.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display mb-3 text-lg text-ink">Related grocery finds</h2>
          <div className="flex flex-wrap gap-2">
            {relatedFinds.map((g) => (
              <Tag key={g.id} variant="neutral">{g.ingredient} · {g.store}</Tag>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display mb-3 text-xl text-ink">Cooking memories</h2>
        {memories.length === 0 ? (
          <p className="text-sm text-ink-soft">No memories logged yet — cook it and tell the story.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {memories.map((m, i) => (
              <MemoryCard key={m.id} memory={m} members={profiles} wobble={["wobble-1", "wobble-2", "wobble-3"][i % 3]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

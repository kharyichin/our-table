import Link from "next/link";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { timeAgo } from "@/lib/utils";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe, wobble = "wobble-1" }: { recipe: Recipe; wobble?: string }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className={`paper-card group flex flex-col gap-3 p-4 transition-transform hover:-translate-y-0.5 ${wobble}`}
    >
      <div className="flex items-start justify-between gap-2">
        <DishIllustration
          seed={recipe.illustrationSeed}
          tags={[...recipe.ingredientTags, ...recipe.cuisineTags]}
          className="h-16 w-16 shrink-0"
        />
        <StatusPill status={recipe.status} />
      </div>
      <div>
        <h3 className="font-display text-lg leading-tight text-ink group-hover:text-tomato-dark">{recipe.title}</h3>
        <p className="mt-1 text-xs text-ink-soft">Discovered {timeAgo(recipe.discoveredDate)}</p>
      </div>
      {recipe.description && <p className="line-clamp-2 text-sm text-ink-soft">{recipe.description}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {recipe.cuisineTags.map((t) => (
          <Tag key={t} variant="cuisine">#{t}</Tag>
        ))}
        {recipe.ingredientTags.map((t) => (
          <Tag key={t} variant="ingredient">#{t}</Tag>
        ))}
      </div>
    </Link>
  );
}

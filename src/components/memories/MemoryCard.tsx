import Link from "next/link";
import { RatingStars } from "@/components/ui/RatingStars";
import { Avatar } from "@/components/ui/Avatar";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";
import { formatMonthDay } from "@/lib/utils";
import type { CookingMemory, Profile } from "@/lib/types";

export function MemoryCard({
  memory,
  members,
  recipeTitle,
  recipeId,
  illustrationSeed,
  illustrationTags,
  wobble = "wobble-1",
}: {
  memory: CookingMemory;
  members: Profile[];
  recipeTitle?: string;
  recipeId?: string;
  illustrationSeed?: string;
  illustrationTags?: string[];
  wobble?: string;
}) {
  const present = members.filter((m) => memory.membersPresent.includes(m.id));
  const titleBlock = recipeTitle && (
    recipeId ? (
      <Link href={`/recipes/${recipeId}`} className="font-display text-lg text-ink hover:text-tomato-dark">
        {recipeTitle}
      </Link>
    ) : (
      <p className="font-display text-lg text-ink">{recipeTitle}</p>
    )
  );

  return (
    <div className={`paper-card ${wobble} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {memory.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memory.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-line object-cover" />
          ) : (
            illustrationSeed && (
              <DishIllustration seed={illustrationSeed} tags={illustrationTags} className="h-12 w-12 shrink-0" />
            )
          )}
          <div>
            {titleBlock}
            <p className="text-xs text-ink-soft">
              {formatMonthDay(memory.dateCooked)}
              {memory.occasion ? ` · ${memory.occasion}` : ""}
            </p>
          </div>
        </div>
        <RatingStars rating={memory.rating} className="shrink-0 text-butter-dark" />
      </div>

      {memory.note && <p className="mt-3 text-sm text-ink italic">&quot;{memory.note}&quot;</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
        {present.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {present.map((p) => (
                <Avatar key={p.id} src={p.avatarUrl} name={p.displayName} size="sm" />
              ))}
            </div>
            <span>{present.map((p) => p.displayName).join(" & ")}</span>
          </div>
        )}
        {memory.wouldMakeAgain === "yes" && <span className="rounded-full bg-basil/15 px-2 py-0.5 font-semibold text-basil-dark">Would make again</span>}
        {memory.wouldMakeAgain === "maybe" && <span className="rounded-full bg-squash/15 px-2 py-0.5 font-semibold text-squash-dark">Maybe again</span>}
        {memory.wouldMakeAgain === "no" && <span className="rounded-full bg-tomato/15 px-2 py-0.5 font-semibold text-tomato-dark">Would not make again</span>}
      </div>

      {memory.changesMade && <p className="mt-2 text-xs text-ink-soft">Changed it up: {memory.changesMade}</p>}
    </div>
  );
}

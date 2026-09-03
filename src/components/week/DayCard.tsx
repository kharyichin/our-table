"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";
import { setMealRecipeAction, setMealStateAction, setMealNoteAction, setMealDinerCountAction } from "@/app/week/actions";
import { DAY_LABELS_FULL } from "@/lib/types";
import { formatMonthDay, cn } from "@/lib/utils";
import type { MealCard, MealState, Recipe } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { CookingMemoryForm } from "@/components/memories/CookingMemoryForm";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";
import { parseServingCount } from "@/lib/ingredients";

const STATE_LABEL: Record<MealState, string> = {
  planned: "Planned",
  cooked: "Cooked",
  skipped: "Skipped",
  replaced: "Replaced",
  eating_out: "Eating out",
};

const STATE_STYLE: Record<MealState, string> = {
  planned: "bg-squash/20 text-squash-dark",
  cooked: "bg-basil/20 text-basil-dark",
  skipped: "bg-ink-soft/15 text-ink-soft",
  replaced: "bg-blueberry/20 text-blueberry-dark",
  eating_out: "bg-plum/20 text-plum-dark",
};

export function DayCard({
  planId,
  dayIndex,
  dateIso,
  card,
  recipes,
  wobble,
  members,
}: {
  planId: string;
  dayIndex: number;
  dateIso: string;
  card: MealCard | undefined;
  recipes: Recipe[];
  wobble: string;
  members: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { pending: isPending, feedback, run } = useMutationFeedback();
  const [note, setNote] = useState(card?.note ?? "");
  const [dinerCount, setDinerCount] = useState((card?.dinerCount ?? members.length) || 1);
  const [logging, setLogging] = useState(false);

  const recipe = card?.recipeId ? recipes.find((r) => r.id === card.recipeId) : null;
  const state: MealState = card?.state ?? "planned";
  const hasRecipe = Boolean(recipe);

  function handleChoice(value: string) {
    run(async () => {
      if (value === "" ) {
        await setMealStateAction(planId, dayIndex, "planned");
        await setMealRecipeAction(planId, dayIndex, null);
      } else if (value === "eating_out" || value === "skipped") {
        await setMealRecipeAction(planId, dayIndex, null);
        await setMealStateAction(planId, dayIndex, value);
      } else {
        await setMealRecipeAction(planId, dayIndex, value, dinerCount);
      }
      router.refresh();
    }, { success: "Meal plan updated." });
  }

  return (
    <div className={cn("paper-card flex min-h-[220px] flex-col p-4", wobble)}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-display text-sm text-tomato-dark">{DAY_LABELS_FULL[dayIndex]}</p>
          <p className="text-[11px] text-ink-soft">{formatMonthDay(dateIso)}</p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATE_STYLE[state])}>
          {STATE_LABEL[state]}
        </span>
      </div>

      {hasRecipe && recipe ? (
        <Link href={`/recipes/${recipe.id}?meal=${card?.id}`} className="mb-2 flex items-center gap-2 rounded-xl p-1 hover:bg-paper-warm/60">
          <DishIllustration seed={recipe.illustrationSeed} tags={[...recipe.ingredientTags, ...recipe.cuisineTags]} className="h-11 w-11 shrink-0" />
          <span className="text-sm font-semibold leading-tight text-ink">{recipe.title}</span>
        </Link>
      ) : (
        <div className="mb-2 flex flex-1 items-center justify-center text-xs text-ink-soft/70">
          {state === "eating_out" ? "Eating out" : state === "skipped" ? "No meal planned" : "Nothing chosen yet"}
        </div>
      )}

      <select
        disabled={isPending}
        value={hasRecipe ? card?.recipeId ?? "" : state === "eating_out" || state === "skipped" ? state : ""}
        onChange={(e) => handleChoice(e.target.value)}
        className="mb-2 rounded-lg border border-line bg-paper px-2 py-1.5 text-xs"
      >
        <option value="">— Not planned —</option>
        <option value="eating_out">Eating out</option>
        <option value="skipped">Skip this day</option>
        <optgroup label="Recipes">
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </optgroup>
      </select>

      {hasRecipe && (
        <>
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-paper-warm/70 px-3 py-2">
          <span className="text-[11px] text-ink-soft">
            {recipe?.servings ? `Recipe serves ${parseServingCount(recipe.servings) ?? recipe.servings}` : "Set for this meal"}
          </span>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-ink">
            Cooking for
            <input
              type="number"
              min={1}
              max={50}
              value={dinerCount}
              disabled={isPending}
              onChange={(event) => setDinerCount(Number(event.target.value))}
              onBlur={() => {
                const nextCount = Number.isInteger(dinerCount) && dinerCount > 0 ? dinerCount : 1;
                setDinerCount(nextCount);
                run(async () => {
                await setMealDinerCountAction(planId, dayIndex, nextCount);
                router.refresh();
                }, { success: "Diner count and shopping amounts updated." });
              }}
              className="w-12 rounded-lg border border-line bg-paper px-2 py-1 text-center text-xs"
            />
          </label>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(["planned", "cooked", "replaced"] as MealState[]).map((s) => (
            <button
              key={s}
              disabled={isPending}
              onClick={() => run(async () => {
                await setMealStateAction(planId, dayIndex, s);
                router.refresh();
              }, { success: "Meal status updated." })}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                state === s ? STATE_STYLE[s] : "bg-paper-warm text-ink-soft"
              )}
            >
              {STATE_LABEL[s]}
            </button>
          ))}
          {state === "cooked" && (
            <button
              onClick={() => setLogging(true)}
              className="rounded-full bg-basil px-2 py-0.5 text-[11px] font-semibold text-paper"
            >
              Add the memory
            </button>
          )}
        </div>
        </>
      )}

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => run(async () => {
          await setMealNoteAction(planId, dayIndex, note);
        }, { success: "Meal note saved." })}
        placeholder="Add a note…"
        className="mt-auto rounded-lg border border-line bg-paper px-2 py-1 text-xs placeholder:text-ink-soft/50 focus:border-tomato focus:outline-none"
      />
      <MutationFeedback feedback={feedback} pending={isPending} pendingMessage="Updating this day…" className="mt-2" />

      {recipe && card && (
        <Modal open={logging} onClose={() => setLogging(false)} title={`Remember ${recipe.title}`} wide>
          <CookingMemoryForm
            recipeId={recipe.id}
            mealCardId={card.id}
            planId={planId}
            dayIndex={dayIndex}
            defaultDate={dateIso}
            members={members}
            onDone={() => {
              setLogging(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

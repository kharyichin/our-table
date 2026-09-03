"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { CookingMemoryForm } from "@/components/memories/CookingMemoryForm";
import { updateRecipeAction, deleteRecipeAction, changeRecipeStatusAction, importRecipeFromSourceAction } from "@/app/recipes/actions";
import { planRecipeForDayAction } from "@/app/week/actions";
import { DAY_LABELS_FULL } from "@/lib/types";
import type { Recipe, RecipeStatus } from "@/lib/types";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";
import { parseServingCount } from "@/lib/ingredients";

const STATUS_OPTIONS: RecipeStatus[] = ["idea", "planned", "cooked", "repeated", "archived"];

export function RecipeDetailActions({
  recipe,
  members,
  planId,
}: {
  recipe: Recipe;
  members: { id: string; name: string }[];
  planId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [dinerCount, setDinerCount] = useState((parseServingCount(recipe.servings) ?? members.length) || 1);
  const { pending: isPending, feedback, run } = useMutationFeedback();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={recipe.status}
        disabled={isPending}
        onChange={(e) => run(async () => {
          await changeRecipeStatusAction(recipe.id, e.target.value as RecipeStatus);
          router.refresh();
        }, { success: "Recipe status updated." })}
        className="rounded-full border border-line bg-paper px-3 py-2 text-sm font-medium"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <Button size="sm" onClick={() => setPlanning(true)}>Add to this week</Button>
      <Button variant="basil" size="sm" onClick={() => setLogging(true)}>Log a memory</Button>
      <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
      {recipe.sourceUrl && (
        <Button variant="secondary" size="sm" disabled={isPending} onClick={() => {
          if (!confirm("Refresh this recipe from its original source? This replaces the saved title, description, serving count, image, ingredients, and method.")) return;
          run(async () => {
            await importRecipeFromSourceAction(recipe.id);
            router.refresh();
          }, { success: "Recipe refreshed from its original source." });
        }}>
          Refresh from source
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(`Remove "${recipe.title}" from the household archive? This can't be undone.`)) {
            run(async () => {
              await deleteRecipeAction(recipe.id);
              router.push("/ideas");
            }, { fallbackError: "The recipe could not be deleted." });
          }
        }}
      >
        Delete
      </Button>
      <MutationFeedback feedback={feedback} pending={isPending} pendingMessage="Updating recipe…" className="basis-full" />

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit recipe" wide>
        <RecipeForm
          recipe={recipe}
          members={members}
          onSubmit={(formData) => updateRecipeAction(recipe.id, formData)}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal open={logging} onClose={() => setLogging(false)} title={`Log a memory: ${recipe.title}`} wide>
        <CookingMemoryForm
          recipeId={recipe.id}
          members={members}
          onDone={() => {
            setLogging(false);
            router.refresh();
          }}
        />
      </Modal>

      <Modal open={planning} onClose={() => setPlanning(false)} title="Choose a place at the table">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">Pick the day when {recipe.title} belongs in this week’s chapter.</p>
          <div className="grid grid-cols-2 gap-2">
            {DAY_LABELS_FULL.map((day, index) => (
              <button
                key={day}
                onClick={() => setDayIndex(index)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${dayIndex === index ? "border-tomato bg-tomato/10 text-tomato-dark" : "border-line bg-paper text-ink"}`}
              >
                {day}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-paper-warm px-4 py-3 text-sm font-semibold text-ink">
            People eating
            <input
              type="number"
              min={1}
              max={50}
              value={dinerCount}
              onChange={(event) => setDinerCount(Number(event.target.value))}
              className="w-16 rounded-xl border border-line bg-paper px-3 py-2 text-center"
            />
          </label>
          <Button disabled={isPending} onClick={() => run(async () => {
            await planRecipeForDayAction(planId, recipe.id, dayIndex, dinerCount);
            setPlanning(false);
            router.push("/week");
          }, { success: "Recipe added to the week." })}>Plan for {DAY_LABELS_FULL[dayIndex]}</Button>
        </div>
      </Modal>
    </div>
  );
}

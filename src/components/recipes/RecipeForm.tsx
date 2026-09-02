"use client";

import { useState, useTransition } from "react";
import { fieldClass, labelClass } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import type { Recipe } from "@/lib/types";
import { MutationFeedback } from "@/components/ui/MutationFeedback";

interface RecipeFormProps {
  recipe?: Recipe;
  members: { id: string; name: string }[];
  onSubmit: (formData: FormData) => Promise<string | void>;
  onDone?: (id?: string) => void;
  submitLabel?: string;
}

export function RecipeForm({ recipe, members, onSubmit, onDone, submitLabel = "Save recipe" }: RecipeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const id = await onSubmit(formData);
            onDone?.(id ?? undefined);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
          }
        });
      }}
    >
      <div>
        <label className={labelClass} htmlFor="title">Title</label>
        <input required id="title" name="title" defaultValue={recipe?.title} className={fieldClass} placeholder="Grandma's Sunday Sauce" />
      </div>

      <div>
        <label className={labelClass} htmlFor="sourceUrl">Source URL</label>
        <input id="sourceUrl" name="sourceUrl" defaultValue={recipe?.sourceUrl ?? ""} className={fieldClass} placeholder="https://…" />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={recipe?.description ?? ""} rows={2} className={fieldClass} placeholder="What makes this one worth keeping?" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cuisineTags">Cuisine tags</label>
          <input id="cuisineTags" name="cuisineTags" defaultValue={recipe?.cuisineTags.join(", ") ?? ""} className={fieldClass} placeholder="japanese, italian" />
        </div>
        <div>
          <label className={labelClass} htmlFor="ingredientTags">Ingredient tags</label>
          <input id="ingredientTags" name="ingredientTags" defaultValue={recipe?.ingredientTags.join(", ") ?? ""} className={fieldClass} placeholder="chicken, tofu" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="ingredients">Ingredients (one per line)</label>
        <textarea id="ingredients" name="ingredients" defaultValue={recipe?.ingredients.join("\n") ?? ""} rows={4} className={fieldClass} placeholder={"2 chicken thighs\n1 cup panko"} />
      </div>

      <div>
        <label className={labelClass} htmlFor="instructions">Instructions</label>
        <textarea id="instructions" name="instructions" defaultValue={recipe?.instructions ?? ""} rows={4} className={fieldClass} placeholder="Step by step…" />
      </div>

      {!recipe && (
        <div>
          <label className={labelClass} htmlFor="discoveredBy">Discovered by</label>
          <select id="discoveredBy" name="discoveredBy" className={fieldClass} defaultValue="">
            <option value="">Unspecified</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <MutationFeedback feedback={error ? { tone: "error", message: error } : null} pending={isPending} />

      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}

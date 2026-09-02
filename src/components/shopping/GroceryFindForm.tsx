"use client";

import { useState, useTransition } from "react";
import { fieldClass, labelClass } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { createGroceryFindAction } from "@/app/shopping/actions";
import { GROCERY_STORES } from "@/lib/types";
import type { Recipe } from "@/lib/types";
import { MutationFeedback } from "@/components/ui/MutationFeedback";

export function GroceryFindForm({ recipes, onDone }: { recipes: Recipe[]; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createGroceryFindAction(formData);
            onDone();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="store">Store</label>
          <select required id="store" name="store" className={fieldClass} defaultValue="">
            <option value="" disabled>Choose a store…</option>
            {GROCERY_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="price">Price</label>
          <input id="price" name="price" type="number" step="0.01" min="0" className={fieldClass} placeholder="4.99" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="ingredient">Ingredient</label>
        <input required id="ingredient" name="ingredient" className={fieldClass} placeholder="Boneless chicken thighs" />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} className={fieldClass} placeholder="What's the deal?" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="expiryDate">Use by</label>
          <input id="expiryDate" name="expiryDate" type="date" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="sourceUrl">Source URL</label>
          <input id="sourceUrl" name="sourceUrl" className={fieldClass} placeholder="https://…" />
        </div>
      </div>

      {recipes.length > 0 && (
        <div>
          <label className={labelClass}>Related recipes</label>
          <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-xl border border-line bg-paper px-3 py-2">
            {recipes.map((r) => (
              <label key={r.id} className="flex items-center gap-1.5 text-sm text-ink">
                <input type="checkbox" name="relatedRecipeIds" value={r.id} className="accent-tomato" />
                {r.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <MutationFeedback feedback={error ? { tone: "error", message: error } : null} pending={isPending} />
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add grocery find"}</Button>
    </form>
  );
}

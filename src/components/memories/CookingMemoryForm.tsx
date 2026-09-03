"use client";

import { useEffect, useState, useTransition } from "react";
import { fieldClass, labelClass } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { createMemoryAction } from "@/app/recipes/actions";
import type { Recipe } from "@/lib/types";
import { MutationFeedback } from "@/components/ui/MutationFeedback";

interface CookingMemoryFormProps {
  recipeId?: string;
  mealCardId?: string;
  planId?: string;
  dayIndex?: number;
  defaultDate?: string;
  recipes?: Recipe[]; // when no fixed recipeId, let the user pick one (Memory Book "log a memory")
  members: { id: string; name: string }[];
  onDone: () => void;
}

export function CookingMemoryForm({ recipeId, mealCardId, planId, dayIndex, defaultDate, recipes, members, onDone }: CookingMemoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createMemoryAction(formData);
            onDone();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
          }
        });
      }}
    >
      {recipeId ? (
        <>
          <input type="hidden" name="recipeId" value={recipeId} />
          {mealCardId && <input type="hidden" name="mealCardId" value={mealCardId} />}
          {planId && <input type="hidden" name="planId" value={planId} />}
          {dayIndex !== undefined && <input type="hidden" name="dayIndex" value={dayIndex} />}
        </>
      ) : (
        <div>
          <label className={labelClass} htmlFor="recipeId">Recipe</label>
          <select required id="recipeId" name="recipeId" className={fieldClass}>
            <option value="">Choose a recipe…</option>
            {recipes?.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="dateCooked">Date cooked</label>
          <input required type="date" id="dateCooked" name="dateCooked" defaultValue={defaultDate ?? new Date().toISOString().slice(0, 10)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="occasion">Occasion</label>
          <input id="occasion" name="occasion" className={fieldClass} placeholder="Sunday dinner, birthday…" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Who was there</label>
        <div className="flex flex-wrap gap-3 rounded-xl border border-line bg-paper px-3 py-2">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-1.5 text-sm text-ink">
              <input type="checkbox" name="membersPresent" value={m.id} className="accent-tomato" />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="photo">Photo</label>
        <div className="flex items-center gap-3">
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Selected cooking memory" className="h-14 w-14 rounded-xl border border-line object-cover" />
          )}
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={handlePhotoChange} className="text-xs text-ink-soft" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="note">The memory</label>
        <textarea id="note" name="note" rows={3} className={fieldClass} placeholder="How did it go? What do you want to remember?" />
      </div>

      <div>
        <label className={labelClass}>Rating</label>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={n <= rating ? "text-butter-dark" : "text-line"}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Would make again?</label>
          <div className="flex gap-4 pt-1 text-sm">
            <label className="flex items-center gap-1.5"><input type="radio" name="wouldMakeAgain" value="yes" defaultChecked /> Yes</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="wouldMakeAgain" value="maybe" /> Maybe</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="wouldMakeAgain" value="no" /> No</label>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="changesMade">Changes made</label>
          <input id="changesMade" name="changesMade" className={fieldClass} placeholder="Doubled the garlic…" />
        </div>
      </div>

      <MutationFeedback feedback={error ? { tone: "error", message: error } : null} pending={isPending} pendingMessage="Saving memory and photo…" />
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save memory"}</Button>
    </form>
  );
}

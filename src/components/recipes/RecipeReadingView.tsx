"use client";

import { useState } from "react";

function instructionSteps(instructions: string): string[] {
  return instructions
    .split(/\n\s*\n|\n(?=\s*\d+[.)]\s)/)
    .map((step) => step.trim().replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);
}

export function RecipeReadingView({ ingredients, instructions }: {
  ingredients: string[];
  instructions: string | null;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const steps = instructions ? instructionSteps(instructions) : [];

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="paper-card p-5 md:sticky md:top-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Ingredients</h2>
          {ingredients.length > 0 && <span className="text-xs text-ink-soft">Tap as you cook</span>}
        </div>
        {ingredients.length > 0 ? (
          <ul className="divide-y divide-line/70">
            {ingredients.map((ingredient, index) => {
              const isChecked = checked.has(index);
              return (
                <li key={`${ingredient}-${index}`}>
                  <label className="flex cursor-pointer items-start gap-3 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setChecked((current) => {
                        const next = new Set(current);
                        if (next.has(index)) next.delete(index); else next.add(index);
                        return next;
                      })}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-tomato"
                    />
                    <span className={isChecked ? "text-ink-soft line-through opacity-60" : "text-ink"}>{ingredient}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-sm text-ink-soft">No ingredients listed yet.</p>}
      </section>

      <section className="paper-card overflow-hidden p-5 sm:p-6">
        <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-line pb-4">
          <h2 className="font-display text-xl text-ink">Method</h2>
          {steps.length > 0 && <span className="text-xs text-ink-soft">{steps.length} {steps.length === 1 ? "step" : "steps"}</span>}
        </div>
        {steps.length > 0 ? (
          <ol className="divide-y divide-line/70">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4 py-5 first:pt-4 last:pb-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">{index + 1}</span>
                <p className="min-w-0 pt-1 text-sm leading-7 text-ink">{step}</p>
              </li>
            ))}
          </ol>
        ) : <p className="pt-4 text-sm text-ink-soft">No instructions written down yet.</p>}
      </section>
    </div>
  );
}

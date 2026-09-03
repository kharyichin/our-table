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
  const [methodMode, setMethodMode] = useState<"full" | "step">("full");
  const [activeStep, setActiveStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const steps = instructions ? instructionSteps(instructions) : [];
  const goToStep = (next: number) => setActiveStep(Math.min(Math.max(next, 0), Math.max(steps.length - 1, 0)));

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
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="font-display text-xl text-ink">Method</h2>
          {steps.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs text-ink-soft">{steps.length} {steps.length === 1 ? "step" : "steps"}</span>
              <div className="flex rounded-full border border-line bg-paper-warm p-1" aria-label="Method view">
                <button type="button" aria-pressed={methodMode === "full"} onClick={() => setMethodMode("full")} className={`rounded-full px-3 py-1.5 text-xs font-bold ${methodMode === "full" ? "bg-ink text-paper" : "text-ink-soft"}`}>Full method</button>
                <button type="button" aria-pressed={methodMode === "step"} onClick={() => setMethodMode("step")} className={`rounded-full px-3 py-1.5 text-xs font-bold ${methodMode === "step" ? "bg-ink text-paper" : "text-ink-soft"}`}>One step</button>
              </div>
            </div>
          )}
        </div>
        {steps.length > 0 && methodMode === "full" ? (
          <ol className="divide-y divide-line/70">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4 py-5 first:pt-4 last:pb-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">{index + 1}</span>
                <p className="min-w-0 max-w-[68ch] pt-1 text-sm leading-7 text-ink">{step}</p>
              </li>
            ))}
          </ol>
        ) : steps.length > 0 ? (
          <div
            className="pt-5"
            onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              if (touchStart === null) return;
              const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
              if (distance < -40) goToStep(activeStep + 1);
              if (distance > 40) goToStep(activeStep - 1);
              setTouchStart(null);
            }}
          >
            <p className="mb-3 text-xs font-bold text-tomato-dark">Step {activeStep + 1} of {steps.length}</p>
            <div className="flex min-h-64 items-start gap-4 rounded-[1.75rem] bg-paper-warm p-5 sm:min-h-72 sm:p-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tomato text-base font-bold text-white">{activeStep + 1}</span>
              <p className="max-w-[62ch] pt-1 text-base leading-8 text-ink sm:text-lg">{steps[activeStep]}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)} className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-35">Previous</button>
              <div className="flex gap-1.5" aria-hidden="true">
                {steps.slice(Math.max(0, activeStep - 2), activeStep + 3).map((_, index) => {
                  const actualIndex = Math.max(0, activeStep - 2) + index;
                  return <span key={actualIndex} className={`h-1.5 rounded-full ${actualIndex === activeStep ? "w-6 bg-tomato" : "w-1.5 bg-line"}`} />;
                })}
              </div>
              <button type="button" disabled={activeStep === steps.length - 1} onClick={() => goToStep(activeStep + 1)} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper disabled:cursor-not-allowed disabled:opacity-35">Next</button>
            </div>
          </div>
        ) : <p className="pt-4 text-sm text-ink-soft">No instructions written down yet.</p>}
      </section>
    </div>
  );
}

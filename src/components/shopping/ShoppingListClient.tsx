"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleCheckedAction, toggleHaveItAction, setItemSubstitutionAction, refreshShoppingListAction, addManualShoppingItemAction } from "@/app/shopping/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/types";
import type { MealCard, Recipe, ShoppingItem } from "@/lib/types";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function ShoppingListClient({
  planId,
  items,
  mealCards,
  recipes,
}: {
  planId: string;
  items: ShoppingItem[];
  mealCards: MealCard[];
  recipes: Recipe[];
}) {
  const router = useRouter();
  const [groupBy, setGroupBy] = useState<"category" | "store">("category");
  const { pending: isPending, feedback, run } = useMutationFeedback();
  const [subEdits, setSubEdits] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  const mealLabel = (mealCardId: string) => {
    const card = mealCards.find((m) => m.id === mealCardId);
    if (!card) return null;
    const recipe = recipes.find((r) => r.id === card.recipeId);
    return `${DAY_LABELS[card.dayIndex]}${recipe ? ` · ${recipe.title}` : ""}`;
  };

  const groups = useMemo(() => {
    const key = (item: ShoppingItem) => (groupBy === "category" ? item.category : item.store || "Unassigned");
    const map = new Map<string, ShoppingItem[]>();
    for (const item of items) {
      const k = key(item);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items, groupBy]);

  const outstanding = items.filter((i) => !i.checked && !i.haveIt).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-soft">Group by</span>
          <div className="flex overflow-hidden rounded-full border border-line">
            {(["category", "store"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={cn("px-3 py-1.5 font-medium", groupBy === g ? "bg-tomato text-paper" : "bg-paper text-ink-soft")}
              >
                {g === "category" ? "Category" : "Store"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-soft">{outstanding} left to get</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={() => run(async () => {
              await refreshShoppingListAction(planId);
              router.refresh();
            }, { success: "Shopping list refreshed." })}
          >
            ↻ Refresh from plan
          </Button>
          <Button size="sm" onClick={() => setAdding((value) => !value)}>+ Add an item</Button>
        </div>
      </div>
      <MutationFeedback feedback={feedback} pending={isPending} pendingMessage="Updating the list…" className="mb-4" />

      {adding && (
        <form
          className="paper-card mb-6 grid gap-2 p-3 sm:grid-cols-[1fr_150px_150px_auto]"
          action={(formData) => run(async () => {
            await addManualShoppingItemAction(planId, formData);
            setAdding(false);
            router.refresh();
          }, { success: "Item added." })}
        >
          <input required name="name" placeholder="What else do we need?" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          <input name="quantity" placeholder="Quantity" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          <input name="store" placeholder="Store (optional)" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          <Button type="submit" size="sm" disabled={isPending}>Add</Button>
        </form>
      )}

      <div className="flex flex-col gap-6">
        {groups.map(([groupName, groupItems]) => (
          <section key={groupName}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">{groupName}</h3>
            <div className="flex flex-col gap-2">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "paper-card flex flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-3",
                    (item.checked || item.haveIt) && "opacity-60"
                  )}
                >
                  <label className="flex flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => run(async () => {
                        await toggleCheckedAction(item.id, e.target.checked);
                        router.refresh();
                      }, { success: "Shopping item updated." })}
                      className="h-5 w-5 accent-tomato"
                    />
                    <span className={cn("text-sm font-medium text-ink", item.checked && "line-through")}>
                      {item.name}
                      {item.quantity && <span className="text-ink-soft"> · {item.quantity}</span>}
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {item.store && <span className="rounded-full bg-paper-warm px-2 py-0.5 text-ink-soft">{item.store}</span>}
                    <label className="flex items-center gap-1 text-ink-soft">
                      <input
                        type="checkbox"
                        checked={item.haveIt}
                        onChange={(e) => run(async () => {
                          await toggleHaveItAction(item.id, e.target.checked);
                          router.refresh();
                        }, { success: "Shopping item updated." })}
                        className="accent-basil"
                      />
                      Already have it
                    </label>
                  </div>

                  <input
                    value={subEdits[item.id] ?? item.substitution ?? ""}
                    onChange={(e) => setSubEdits((s) => ({ ...s, [item.id]: e.target.value }))}
                    onBlur={(e) => run(() => setItemSubstitutionAction(item.id, e.target.value), { success: "Substitution saved." })}
                    placeholder="Substitution…"
                    className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-xs sm:w-40"
                  />

                  {item.sourceMealCardIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.sourceMealCardIds.map((id) => {
                        const label = mealLabel(id);
                        return label ? (
                          <span key={id} className="rounded-full bg-blueberry/10 px-2 py-0.5 text-[10px] text-blueberry-dark">
                            {label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-ink-soft">
            Nothing on the list yet. Plan a few meals in <a href="/week" className="underline">This Week</a> and refresh.
          </p>
        )}
      </div>
    </div>
  );
}

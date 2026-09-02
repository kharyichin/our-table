"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroceryFindForm } from "@/components/shopping/GroceryFindForm";
import { deleteGroceryFindAction } from "@/app/shopping/actions";
import { formatMonthDay } from "@/lib/utils";
import { GROCERY_STORES } from "@/lib/types";
import type { GroceryFind, GroceryFindWithLifecycle, Recipe } from "@/lib/types";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function GroceryFindsClient({
  finds,
  historicalFinds,
  recipes,
  today,
}: {
  finds: GroceryFind[];
  historicalFinds: GroceryFindWithLifecycle[];
  recipes: Recipe[];
  today: string;
}) {
  const router = useRouter();
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [expirySoon, setExpirySoon] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { pending: isPending, feedback, run } = useMutationFeedback();

  const filtered = finds.filter((f) => {
    if (storeFilter !== "all" && f.store !== storeFilter) return false;
    if (expirySoon) {
      if (!f.expiryDate) return false;
      const days = (new Date(`${f.expiryDate}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / (1000 * 60 * 60 * 24);
      if (days > 5) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="rounded-full border border-line bg-paper px-3 py-2 text-sm">
          <option value="all">All stores</option>
          {GROCERY_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          <input type="checkbox" checked={expirySoon} onChange={(e) => setExpirySoon(e.target.checked)} className="accent-tomato" />
          Expiring soon
        </label>
        <Button size="sm" className="ml-auto" onClick={() => setShowNew(true)}>+ Add find</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="basket" title="No finds here" body="Log a deal from the store, or wait for one to land from the Telegram group." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div key={g.id} className="paper-card flex flex-col gap-1 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-ink">{g.ingredient}</p>
                {g.price != null && <span className="shrink-0 text-sm font-semibold text-basil-dark">${g.price.toFixed(2)}</span>}
              </div>
              <p className="text-xs text-ink-soft">{g.store}{g.expiryDate ? ` · use by ${formatMonthDay(g.expiryDate)}` : ""}</p>
              {g.description && <p className="mt-1 text-xs text-ink-soft">{g.description}</p>}
              <button
                disabled={isPending}
                onClick={() => run(async () => {
                  await deleteGroceryFindAction(g.id);
                  router.refresh();
                }, { success: "Grocery find removed." })}
                className="mt-2 self-start text-xs text-tomato-dark hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <MutationFeedback feedback={feedback} pending={isPending} pendingMessage="Updating grocery finds…" className="mt-3" />

      {historicalFinds.length > 0 && (
        <section className="mt-10 border-t border-line pt-7">
          <p className="chapter-kicker">Kept with the story</p>
          <h2 className="font-display text-2xl text-ink">Past finds that shaped a meal</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">These offers have ended, but they remain attached to recipes that reached the household table.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historicalFinds.map((find) => (
              <div key={find.id} className="paper-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{find.ingredient}</p>
                  <span className="rounded-full bg-paper-warm px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">Past find</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">{find.store}{find.expiryDate ? ` · ended ${formatMonthDay(find.expiryDate)}` : ""}</p>
                {find.description && <p className="mt-2 text-xs text-ink-soft">{find.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Log a grocery find" wide>
        <GroceryFindForm recipes={recipes} onDone={() => { setShowNew(false); router.refresh(); }} />
      </Modal>
    </div>
  );
}

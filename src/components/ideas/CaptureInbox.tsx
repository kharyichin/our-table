"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveCaptureAction } from "@/app/ideas/actions";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import type { Capture } from "@/lib/types";
import { splitRecipeHashtags } from "@/lib/telegram/parse";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function CaptureInbox({ captures }: { captures: Capture[] }) {
  const router = useRouter();
  const { pending: isPending, feedback, run } = useMutationFeedback();
  const [openCapture, setOpenCapture] = useState<string | null>(captures[0]?.id ?? null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [cuisineTags, setCuisineTags] = useState<Record<string, string>>({});
  const [ingredientTags, setIngredientTags] = useState<Record<string, string>>({});

  if (captures.length === 0) return null;

  return (
    <section className="paper-card wobble-2 mb-8 border-2 border-dashed border-squash/50 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="journal-kicker">Inbox</span>
        <h2 className="font-display text-lg text-ink">Telegram inbox</h2>
        <span className="rounded-full bg-squash/20 px-2 py-0.5 text-xs font-semibold text-squash-dark">{captures.length}</span>
      </div>
      <p className="mb-4 text-sm text-ink-soft">
        I wasn&apos;t sure what these were — sort them into the garden or the shopping list.
      </p>
      <div className="flex flex-col gap-3">
        {captures.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-paper-warm/40 p-3">
            {c.imageUrls[0] && (
              // eslint-disable-next-line @next/next/no-img-element -- authenticated app route, not a static optimizable asset
              <img src={c.imageUrls[0]} alt="Telegram capture" className="mb-3 max-h-56 w-full rounded-xl border border-line object-cover" />
            )}
            <p className="text-sm text-ink whitespace-pre-line">{c.rawText}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {c.senderName ? `${c.senderName} · ` : ""}
              {timeAgo(c.createdAt)}
              {c.messageLink && (
                <>
                  {" · "}
                  <a href={c.messageLink} target="_blank" rel="noreferrer" className="underline">
                    view in Telegram
                  </a>
                </>
              )}
            </p>
            {openCapture === c.id && (() => {
              const inferred = splitRecipeHashtags(c.hashtags);
              return (
                <div className="mt-3 grid gap-2 rounded-xl border border-line bg-paper p-3 sm:grid-cols-2">
                  <label className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Title or item name
                    <input
                      value={titles[c.id] ?? c.rawText?.split("\n").find((line) => line.trim() && !line.trim().startsWith("#") && !line.startsWith("http"))?.slice(0, 80) ?? ""}
                      onChange={(event) => setTitles((current) => ({ ...current, [c.id]: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Cuisine tags
                    <input
                      value={cuisineTags[c.id] ?? inferred.cuisineTags.join(", ")}
                      onChange={(event) => setCuisineTags((current) => ({ ...current, [c.id]: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink"
                      placeholder="japanese, mexican"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Ingredient tags
                    <input
                      value={ingredientTags[c.id] ?? inferred.ingredientTags.join(", ")}
                      onChange={(event) => setIngredientTags((current) => ({ ...current, [c.id]: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink"
                      placeholder="chicken, tofu"
                    />
                  </label>
                </div>
              );
            })()}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpenCapture(openCapture === c.id ? null : c.id)}>
                {openCapture === c.id ? "Hide review" : "Review details"}
              </Button>
              <Button
                size="sm"
                variant="basil"
                disabled={isPending}
                onClick={() => run(async () => {
                  await resolveCaptureAction(
                    c.id,
                    "recipe",
                    titles[c.id],
                    cuisineTags[c.id],
                    ingredientTags[c.id]
                  );
                  router.refresh();
                }, { success: "Capture saved as a recipe." })}
              >
                It&apos;s a recipe
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => run(async () => {
                  await resolveCaptureAction(c.id, "grocery");
                  router.refresh();
                }, { success: "Capture saved as a grocery find." })}
              >
                It&apos;s a grocery find
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => run(async () => {
                  await resolveCaptureAction(c.id, "dismiss");
                  router.refresh();
                }, { success: "Capture dismissed." })}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
      <MutationFeedback feedback={feedback} pending={isPending} pendingMessage="Sorting this capture…" className="mt-3" />
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { submitMockCaptureAction } from "@/app/ideas/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { fieldClass, labelClass } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { LineIcon } from "@/components/ui/LineIcon";
import { MutationFeedback } from "@/components/ui/MutationFeedback";

export function MockCapture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ kind: "recipe" | "grocery" | "review"; label: string } | null>(null);

  return (
    <>
      <Button variant="secondary" onClick={() => { setResult(null); setOpen(true); }}>Try a capture</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Send something to Our Table" wide>
        {result ? (
          <div className="capture-result flex flex-col items-center gap-3 py-6 text-center">
            <div className="empty-state-mark"><LineIcon name={result.kind === "recipe" ? "sprout" : result.kind === "grocery" ? "basket" : "inbox"} className="h-8 w-8" /></div>
            <h3 className="font-display text-2xl text-ink">{result.kind === "review" ? result.label : `Saved ${result.label}`}</h3>
            <p className="max-w-md text-sm text-ink-soft">
              {result.kind === "recipe" ? "It’s growing in the Idea Garden." : result.kind === "grocery" ? "It’s waiting with this week’s grocery finds." : "Open the inbox below to decide where it belongs."}
            </p>
            <Button onClick={() => { setOpen(false); router.refresh(); }}>Back to the garden</Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            action={(formData) => {
              setError(null);
              startTransition(async () => {
                try {
                  const next = await submitMockCaptureAction(formData);
                  setResult(next);
                  router.refresh();
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "That message could not be captured");
                }
              });
            }}
          >
            <div className="rounded-2xl bg-paper-warm p-4 text-sm text-ink-soft">
              Write it like you would in the household Telegram group. Ingredient and cuisine hashtags help Our Table put it away correctly.
            </div>
            <div>
              <label htmlFor="senderName" className={labelClass}>Sent by</label>
              <input id="senderName" name="senderName" className={fieldClass} defaultValue="Mina" />
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>Message</label>
              <textarea
                required
                id="message"
                name="message"
                rows={6}
                className={fieldClass}
                defaultValue={"#eggplant #japanese\n\nWant to try miso glazed eggplant next week.\nhttps://example.com/miso-eggplant"}
              />
            </div>
            <p className="text-xs text-ink-soft">Try a recipe, a grocery deal, or an uncertain note—the same capture rules as Telegram will run locally.</p>
            <MutationFeedback feedback={error ? { tone: "error", message: error } : null} pending={pending} pendingMessage="Sorting this capture…" />
            <Button type="submit" disabled={pending}>{pending ? "Capturing…" : "Capture message"}</Button>
          </form>
        )}
      </Modal>
    </>
  );
}

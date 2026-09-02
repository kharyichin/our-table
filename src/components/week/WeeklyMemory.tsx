"use client";

import { useState } from "react";
import { updateWeeklyMemoryAction } from "@/app/week/actions";
import { Button } from "@/components/ui/Button";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function WeeklyMemory({ planId, initialMemory }: { planId: string; initialMemory: string | null }) {
  const [memory, setMemory] = useState(initialMemory ?? "");
  const [editing, setEditing] = useState(!initialMemory);
  const { pending, feedback, run } = useMutationFeedback();

  return (
    <section className="week-closing-note">
      <div>
        <p className="chapter-kicker">What we’ll remember</p>
        <h2 className="font-display text-2xl text-ink">A note from this week</h2>
      </div>
      {editing ? (
        <div className="mt-4">
          <textarea
            value={memory}
            onChange={(event) => setMemory(event.target.value)}
            rows={3}
            autoFocus={Boolean(initialMemory)}
            placeholder="What changed, surprised you, or made this week feel like yours?"
            className="w-full resize-none border-0 border-b-2 border-line bg-transparent px-1 py-2 text-base leading-7 text-ink outline-none focus:border-tomato"
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={pending} onClick={() => run(async () => {
              await updateWeeklyMemoryAction(planId, memory);
              setEditing(false);
            }, { success: "Weekly note saved." })}>{pending ? "Saving…" : "Keep this note"}</Button>
            {initialMemory && <Button size="sm" variant="ghost" onClick={() => { setMemory(initialMemory); setEditing(false); }}>Cancel</Button>}
          </div>
          <MutationFeedback feedback={feedback} pending={pending} className="mt-2" />
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-4 block w-full text-left">
          <p className="max-w-3xl font-display text-xl leading-8 text-ink">“{memory}”</p>
          <span className="mt-2 block text-xs font-semibold text-tomato-dark">Edit the closing note</span>
        </button>
      )}
    </section>
  );
}

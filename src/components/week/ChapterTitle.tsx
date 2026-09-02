"use client";

import { useState } from "react";
import { updateChapterTitleAction } from "@/app/week/actions";
import { LineIcon } from "@/components/ui/LineIcon";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function ChapterTitle({ planId, initialTitle }: { planId: string; initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const { pending: isPending, feedback, run } = useMutationFeedback();

  if (!editing) {
    return (
      <div>
      <button
        onClick={() => setEditing(true)}
        className="group flex items-center gap-2 text-left"
        title="Click to rename this week's chapter"
      >
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        <LineIcon name="pencil" className="h-4 w-4 text-ink-soft opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      <MutationFeedback feedback={feedback} pending={isPending} className="mt-1" />
      </div>
    );
  }

  return (
    <input
      autoFocus
      value={title}
      disabled={isPending}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => {
        setEditing(false);
        run(() => updateChapterTitleAction(planId, title), { success: "Chapter title saved." });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="font-display w-full max-w-xl rounded-xl border-2 border-tomato/40 bg-paper px-3 py-1 text-3xl text-ink focus:outline-none sm:text-4xl"
    />
  );
}

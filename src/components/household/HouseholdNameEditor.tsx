"use client";

import { useState } from "react";
import { updateHouseholdNameAction } from "@/app/household/settings/actions";
import { LineIcon } from "@/components/ui/LineIcon";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";

export function HouseholdNameEditor({ householdId, initialName, canEdit = false }: { householdId: string; initialName: string; canEdit?: boolean }) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const { pending: isPending, feedback, run } = useMutationFeedback();

  if (!editing) {
    if (!canEdit) return <h1 className="font-display text-3xl text-ink sm:text-4xl">{name}</h1>;
    return (
      <div>
      <button onClick={() => setEditing(true)} className="group flex items-center gap-2 text-left">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{name}</h1>
        <LineIcon name="pencil" className="h-4 w-4 text-ink-soft opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      <MutationFeedback feedback={feedback} pending={isPending} className="mt-1" />
      </div>
    );
  }

  return (
    <input
      autoFocus
      value={name}
      disabled={isPending}
      onChange={(e) => setName(e.target.value)}
      onBlur={() => {
        setEditing(false);
        run(() => updateHouseholdNameAction(householdId, name), { success: "Household name saved." });
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="font-display w-full max-w-md rounded-xl border-2 border-tomato/40 bg-paper px-3 py-1 text-3xl text-ink focus:outline-none sm:text-4xl"
    />
  );
}

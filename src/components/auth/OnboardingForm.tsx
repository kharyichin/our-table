"use client";

import { useActionState, useState } from "react";
import { createHouseholdAction, joinHouseholdAction } from "@/app/onboarding/actions";
import type { OnboardingState } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/form";

const INITIAL_ONBOARDING_STATE: OnboardingState = { error: null };

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [createState, createAction, creating] = useActionState(createHouseholdAction, INITIAL_ONBOARDING_STATE);
  const [joinState, joinAction, joining] = useActionState(joinHouseholdAction, INITIAL_ONBOARDING_STATE);
  const state = mode === "create" ? createState : joinState;

  return (
    <div className="mt-7">
      <div className="chapter-view-switch mb-5" aria-label="Choose onboarding path">
        <button className={mode === "create" ? "is-active" : ""} onClick={() => setMode("create")} type="button">Create a household</button>
        <button className={mode === "join" ? "is-active" : ""} onClick={() => setMode("join")} type="button">Join with a code</button>
      </div>
      <form action={mode === "create" ? createAction : joinAction} className="flex flex-col gap-4">
        <label>
          <span className={labelClass}>Your name</span>
          <input required name="displayName" defaultValue={defaultName} className={fieldClass} autoComplete="name" />
        </label>
        {mode === "create" ? (
          <label>
            <span className={labelClass}>Household name</span>
            <input required name="householdName" className={fieldClass} placeholder="Our Table" />
          </label>
        ) : (
          <label>
            <span className={labelClass}>Invitation code</span>
            <input required name="inviteCode" className={fieldClass} placeholder="table24" autoCapitalize="none" />
          </label>
        )}
        {state.error && <p className="text-sm text-tomato-dark">{state.error}</p>}
        <Button type="submit" disabled={creating || joining}>{creating || joining ? "Setting the table…" : mode === "create" ? "Create our household" : "Join the household"}</Button>
      </form>
    </div>
  );
}

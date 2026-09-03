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
      <div className="auth-paths" aria-label="Choose how to set your table">
        <button className={mode === "create" ? "is-active" : ""} aria-pressed={mode === "create"} onClick={() => setMode("create")} type="button">
          <strong>Start a new table</strong>
          <span>Create the household and invite people afterward.</span>
        </button>
        <button className={mode === "join" ? "is-active" : ""} aria-pressed={mode === "join"} onClick={() => setMode("join")} type="button">
          <strong>Join someone’s table</strong>
          <span>Use the code from the invitation they shared.</span>
        </button>
      </div>
      <form action={mode === "create" ? createAction : joinAction} className="auth-onboarding-form">
        <label>
          <span className={labelClass}>Your name</span>
          <input required name="displayName" defaultValue={defaultName} className={fieldClass} autoComplete="name" />
        </label>
        {mode === "create" ? (
          <label>
            <span className={labelClass}>Household name</span>
            <input required name="householdName" className={fieldClass} placeholder="The Chen–Rivera table" />
          </label>
        ) : (
          <label>
            <span className={labelClass}>Invitation code</span>
            <input required name="inviteCode" className={fieldClass} placeholder="table24" autoCapitalize="none" autoCorrect="off" />
          </label>
        )}
        {state.error && <p role="alert" className="text-sm text-tomato-dark">{state.error}</p>}
        <Button type="submit" size="lg" disabled={creating || joining}>{creating || joining ? "Setting the table…" : mode === "create" ? "Create our household" : "Join this household"}</Button>
      </form>
    </div>
  );
}

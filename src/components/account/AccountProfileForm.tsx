"use client";

import { useActionState, useId, useState } from "react";
import { updateAccountProfileAction } from "@/app/account/actions";
import { Button } from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/form";
import type { Profile } from "@/lib/types";
import { ALLERGY_OPTIONS, CUISINE_OPTIONS, DIETARY_PREFERENCE_OPTIONS } from "@/lib/profile-options";

export function AccountProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateAccountProfileAction, { error: null, saved: false });
  return (
    <form action={action} className="account-notes grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className={labelClass}>Your name at the table</span>
        <input name="displayName" required defaultValue={profile.displayName} className={fieldClass} autoComplete="name" />
      </label>
      <PreferencePicker name="dietaryPreferences" label="Dietary preferences" options={DIETARY_PREFERENCE_OPTIONS} selected={profile.dietaryPreferences} />
      <PreferencePicker name="allergies" label="Allergies" options={ALLERGY_OPTIONS} selected={profile.allergies} />
      <PreferencePicker name="favouriteCuisines" label="Favourite cuisines" options={CUISINE_OPTIONS} selected={profile.favouriteCuisines} className="sm:col-span-2" />
      <p className="text-xs leading-relaxed text-ink-soft sm:col-span-2">Select any that apply. Allergy warnings will be added after ingredient matching is dependable.</p>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save my notes"}</Button>
        {state.saved && <span className="text-sm font-semibold text-basil-dark">Saved</span>}
        {state.error && <span className="text-sm text-tomato-dark">{state.error}</span>}
      </div>
    </form>
  );
}

function PreferencePicker({ name, label, options, selected, className }: {
  name: string;
  label: string;
  options: readonly string[];
  selected: string[];
  className?: string;
}) {
  const otherId = useId();
  const customValues = selected.filter((value) => !options.includes(value));
  const [otherOpen, setOtherOpen] = useState(customValues.length > 0);
  return (
    <fieldset className={className}>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input className="peer sr-only" type="checkbox" name={name} value={option} defaultChecked={selected.includes(option)} />
            <span className="inline-flex min-h-9 items-center rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors peer-checked:border-tomato peer-checked:bg-tomato peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tomato">
              {option}
            </span>
          </label>
        ))}
        <label className="cursor-pointer">
          <input
            className="peer sr-only"
            type="checkbox"
            checked={otherOpen}
            onChange={(event) => setOtherOpen(event.target.checked)}
            aria-controls={otherId}
          />
          <span className="inline-flex min-h-9 items-center rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors peer-checked:border-basil peer-checked:bg-basil peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-basil">
            Other
          </span>
        </label>
      </div>
      {otherOpen && (
        <div id={otherId} className="mt-3">
          <label className="sr-only" htmlFor={`${otherId}-input`}>Other {label.toLowerCase()}</label>
          <input
            id={`${otherId}-input`}
            name={name}
            defaultValue={customValues.join(", ")}
            className={fieldClass}
            placeholder={`Add other ${label.toLowerCase()}`}
            autoFocus={customValues.length === 0}
          />
          <p className="mt-1 text-xs text-ink-soft">Separate several entries with commas.</p>
        </div>
      )}
    </fieldset>
  );
}

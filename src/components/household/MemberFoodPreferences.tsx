import { updateProfileFoodPreferencesAction } from "@/app/household/settings/actions";
import type { Profile } from "@/lib/types";

export function MemberFoodPreferences({ profile }: { profile: Profile }) {
  return (
    <details className="member-preferences mt-3">
      <summary>Food preferences</summary>
      <form action={updateProfileFoodPreferencesAction} className="mt-4 grid gap-4 sm:grid-cols-3">
        <input type="hidden" name="profileId" value={profile.id} />
        <label>
          <span>Dietary preferences</span>
          <input name="dietaryPreferences" defaultValue={profile.dietaryPreferences.join(", ")} placeholder="Vegetarian, low dairy" />
        </label>
        <label>
          <span>Allergies</span>
          <input name="allergies" defaultValue={profile.allergies.join(", ")} placeholder="Shellfish, peanuts" />
        </label>
        <label>
          <span>Favourite cuisines</span>
          <input name="favouriteCuisines" defaultValue={profile.favouriteCuisines.join(", ")} placeholder="Japanese, Mexican" />
        </label>
        <p className="text-xs text-ink-soft sm:col-span-2">Separate multiple entries with commas. Allergies will inform planning warnings in a later implementation.</p>
        <button className="justify-self-start rounded-full bg-tomato px-4 py-2 text-xs font-bold text-paper sm:justify-self-end" type="submit">Save preferences</button>
      </form>
    </details>
  );
}

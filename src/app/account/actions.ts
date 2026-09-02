"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function list(values: FormDataEntryValue[]) {
  return [...new Set(values.flatMap((value) => String(value).split(",")).map((item) => item.trim()).filter(Boolean))];
}

export async function updateAccountProfileAction(_state: { error: string | null; saved: boolean }, formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured.", saved: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again.", saved: false };

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Your name is required.", saved: false };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    dietary_preferences: list(formData.getAll("dietaryPreferences")),
    allergies: list(formData.getAll("allergies")),
    favourite_cuisines: list(formData.getAll("favouriteCuisines")),
  }, { onConflict: "id" });
  if (error) return { error: error.message, saved: false };

  revalidatePath("/account");
  revalidatePath("/household/settings");
  revalidatePath("/home");
  return { error: null, saved: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { updateProfileFoodPreferences } from "@/lib/data/household";
import { createHash, randomBytes } from "node:crypto";

async function requireOwner(householdId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in again.");
  const { data: membership } = await supabase!
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (membership?.role !== "owner") throw new Error("Only the household owner can do that.");
  const service = getSupabaseServiceClient();
  if (!service) throw new Error("Server configuration is incomplete.");
  return { service, user };
}

export async function updateHouseholdNameAction(householdId: string, name: string) {
  if (!name.trim()) throw new Error("Household name can't be empty");
  const { service } = await requireOwner(householdId);
  const { error } = await service.from("households").update({ name: name.trim() }).eq("id", householdId);
  if (error) throw new Error(error.message);
  revalidatePath("/household/settings");
  revalidatePath("/home");
}

function list(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export async function updateProfileFoodPreferencesAction(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) throw new Error("A household member is required");
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user || user.id !== profileId) throw new Error("You can only update your own food preferences.");
  await updateProfileFoodPreferences(profileId, {
    dietaryPreferences: list(formData.get("dietaryPreferences")),
    allergies: list(formData.get("allergies")),
    favouriteCuisines: list(formData.get("favouriteCuisines")),
  });
  revalidatePath("/household/settings");
}

export async function removeHouseholdMemberAction(householdId: string, memberId: string) {
  const { service, user } = await requireOwner(householdId);
  const { data: member } = await service
    .from("household_members")
    .select("id,profile_id,role")
    .eq("id", memberId)
    .eq("household_id", householdId)
    .maybeSingle();
  if (!member) throw new Error("That household member no longer exists.");
  if (member.profile_id === user.id || member.role === "owner") throw new Error("The household owner cannot be removed.");
  const { error } = await service.from("household_members").delete().eq("id", member.id);
  if (error) throw new Error(error.message);
  revalidatePath("/household/settings");
  revalidatePath("/home");
}

export async function createTelegramLinkCodeAction(householdId: string): Promise<{ command: string }> {
  const { service, user } = await requireOwner(householdId);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const token = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await service.from("telegram_link_tokens").upsert({
    household_id: householdId,
    token_hash: tokenHash,
    created_by: user.id,
    expires_at: expiresAt,
  }, { onConflict: "household_id" });
  if (error) throw new Error(error.message);
  return { command: `/link ${token}` };
}

export async function disconnectTelegramAction(householdId: string): Promise<void> {
  const { service } = await requireOwner(householdId);
  const { error } = await service.from("telegram_links").delete().eq("household_id", householdId);
  if (error) throw new Error(error.message);
  await service.from("telegram_link_tokens").delete().eq("household_id", householdId);
  revalidatePath("/household/settings");
}

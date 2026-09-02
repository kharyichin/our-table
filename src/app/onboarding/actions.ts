"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";

export interface OnboardingState { error: string | null }

async function authenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  return user;
}

async function ensureProfile(userId: string, displayName: string) {
  const service = getSupabaseServiceClient();
  if (!service) throw new Error("Server configuration is incomplete");
  const { error } = await service.from("profiles").upsert({ id: userId, display_name: displayName }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return service;
}

export async function createHouseholdAction(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await authenticatedUser();
  if (!user) return { error: "Your session expired. Sign in again." };
  const displayName = String(formData.get("displayName") ?? "").trim();
  const householdName = String(formData.get("householdName") ?? "").trim();
  if (!displayName || !householdName) return { error: "Your name and household name are required." };

  try {
    const service = await ensureProfile(user.id, displayName);
    const { data: household, error: householdError } = await service.from("households").insert({ name: householdName }).select("id").single();
    if (householdError) throw new Error(householdError.message);
    const { error: memberError } = await service.from("household_members").insert({ household_id: household.id, profile_id: user.id, role: "owner" });
    if (memberError) {
      await service.from("households").delete().eq("id", household.id);
      throw new Error(memberError.message);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The household could not be created." };
  }
  redirect("/home");
}

export async function joinHouseholdAction(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await authenticatedUser();
  if (!user) return { error: "Your session expired. Sign in again." };
  const displayName = String(formData.get("displayName") ?? "").trim();
  const inviteCode = String(formData.get("inviteCode") ?? "").trim().toLowerCase();
  if (!displayName || !inviteCode) return { error: "Your name and invitation code are required." };

  try {
    const service = await ensureProfile(user.id, displayName);
    const { data: household, error: lookupError } = await service.from("households").select("id").eq("invite_code", inviteCode).maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!household) return { error: "That invitation code does not match a household." };
    const { error: memberError } = await service.from("household_members").upsert(
      { household_id: household.id, profile_id: user.id, role: "member" },
      { onConflict: "household_id,profile_id", ignoreDuplicates: true }
    );
    if (memberError) throw new Error(memberError.message);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The household could not be joined." };
  }
  redirect("/home");
}

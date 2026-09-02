/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore } from "./store";
import type { Household, HouseholdMember, Profile, TelegramLink } from "@/lib/types";
import { redirect } from "next/navigation";

export async function getDemoHouseholdId(): Promise<string> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) redirect("/sign-in");

    const { data, error } = await supabase!
      .from("household_members")
      .select("household_id")
      .eq("profile_id", user.id)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return data.household_id as string;
    redirect("/onboarding");
  }
  return demoStore.households[0].id;
}

export async function getHousehold(householdId: string): Promise<Household | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("households")
      .select("*")
      .eq("id", householdId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      inviteCode: data.invite_code,
      createdAt: data.created_at,
    };
  }
  return demoStore.households.find((h) => h.id === householdId) ?? null;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("household_members")
      .select("*, profiles(*)")
      .eq("household_id", householdId);
    return (data ?? []).map((row: any) => ({
      id: row.id,
      householdId: row.household_id,
      profileId: row.profile_id,
      role: row.role,
      joinedAt: row.joined_at,
      profile: row.profiles
        ? {
            id: row.profiles.id,
            displayName: row.profiles.display_name,
            avatarUrl: row.profiles.avatar_url,
            telegramUserId: row.profiles.telegram_user_id == null ? null : Number(row.profiles.telegram_user_id),
            dietaryPreferences: row.profiles.dietary_preferences ?? [],
            allergies: row.profiles.allergies ?? [],
            favouriteCuisines: row.profiles.favourite_cuisines ?? [],
            createdAt: row.profiles.created_at,
          }
        : undefined,
    }));
  }
  return demoStore.members.filter((m) => m.householdId === householdId);
}

export async function getProfiles(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return [];
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!.from("profiles").select("*").in("id", ids);
    return (data ?? []).map((row: any) => ({
      id: row.id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      telegramUserId: row.telegram_user_id == null ? null : Number(row.telegram_user_id),
      dietaryPreferences: row.dietary_preferences ?? [],
      allergies: row.allergies ?? [],
      favouriteCuisines: row.favourite_cuisines ?? [],
      createdAt: row.created_at,
    }));
  }
  return demoStore.profiles.filter((p) => ids.includes(p.id));
}

export async function getTelegramLink(householdId: string): Promise<TelegramLink | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("telegram_links")
      .select("*")
      .eq("household_id", householdId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      householdId: data.household_id,
      telegramChatId: Number(data.telegram_chat_id),
      chatTitle: data.chat_title,
      linkedAt: data.linked_at,
    };
  }
  // Demo mode: reflects the illustrative link from supabase/seed.sql so the
  // settings page has something to show without a real bot connection.
  return {
    id: "tg-demo",
    householdId,
    telegramChatId: -1001234567890,
    chatTitle: "Our Table",
    linkedAt: new Date().toISOString(),
  };
}

export async function updateHouseholdName(householdId: string, name: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("households").update({ name }).eq("id", householdId);
    return;
  }
  const household = demoStore.households.find((h) => h.id === householdId);
  if (household) household.name = name;
}

export async function updateProfileFoodPreferences(profileId: string, values: Pick<Profile, "dietaryPreferences" | "allergies" | "favouriteCuisines">): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("profiles").update({
      dietary_preferences: values.dietaryPreferences,
      allergies: values.allergies,
      favourite_cuisines: values.favouriteCuisines,
    }).eq("id", profileId);
    return;
  }
  const profile = demoStore.profiles.find((item) => item.id === profileId);
  if (!profile) return;
  Object.assign(profile, values);
  const member = demoStore.members.find((item) => item.profileId === profileId);
  if (member?.profile) Object.assign(member.profile, values);
}

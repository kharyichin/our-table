"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";

export async function acceptHouseholdInviteAction(formData: FormData) {
  const code = String(formData.get("inviteCode") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!code || !displayName) redirect(`/join/${encodeURIComponent(code)}?error=invalid`);

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/join/${code}`)}`);

  const service = getSupabaseServiceClient();
  if (!service) redirect(`/join/${encodeURIComponent(code)}?error=join_failed`);

  const { data: existing } = await service.from("household_members").select("household_id").eq("profile_id", user.id).limit(1).maybeSingle();
  const { data: household } = await service.from("households").select("id").eq("invite_code", code).maybeSingle();
  if (!household) redirect(`/join/${encodeURIComponent(code)}?error=invalid`);
  if (existing?.household_id === household.id) redirect("/home");
  if (existing) redirect(`/join/${encodeURIComponent(code)}?error=already_member`);

  const { error: profileError } = await service.from("profiles").upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
  if (profileError) redirect(`/join/${encodeURIComponent(code)}?error=join_failed`);
  const { error: memberError } = await service.from("household_members").insert({ household_id: household.id, profile_id: user.id, role: "member" });
  if (memberError) redirect(`/join/${encodeURIComponent(code)}?error=join_failed`);
  redirect("/home");
}

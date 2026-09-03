import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AuthBookShell } from "@/components/auth/AuthBookShell";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) redirect("/home");
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: membership } = await supabase!.from("household_members").select("household_id").eq("profile_id", user.id).limit(1).maybeSingle();
  if (membership) redirect("/home");
  const defaultName = String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
  return (
    <AuthBookShell
      title="Set your table"
      introduction="Start a household cookbook of your own, or use an invitation code to join one already being written."
    >
      <div className="auth-identity">
        <span>Signed in as</span>
        <strong>{user.email}</strong>
        <SignOutButton className="auth-sign-out" />
      </div>
      <OnboardingForm defaultName={defaultName} />
    </AuthBookShell>
  );
}

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) redirect("/home");
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: membership } = await supabase!.from("household_members").select("household_id").eq("profile_id", user.id).limit(1).maybeSingle();
  if (membership) redirect("/home");
  const defaultName = String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
  return (
    <div className="auth-page">
      <section className="auth-sheet">
        <p className="journal-kicker">Signed in</p>
        <h1 className="font-display mt-2 text-4xl text-ink">Let’s set your table</h1>
        <p className="mt-3 text-sm text-ink-soft">Create a household for your table, or join someone who already invited you.</p>
        <OnboardingForm defaultName={defaultName} />
        <div className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">
          Signed in as {user.email} <SignOutButton className="ml-2" />
        </div>
      </section>
    </div>
  );
}

import { SignInForm } from "@/components/auth/SignInForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button, LinkButton } from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/form";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { acceptHouseholdInviteAction } from "./actions";

const INVITE_ERRORS: Record<string, string> = {
  invalid: "This invitation is no longer valid.",
  already_member: "This account already belongs to another household.",
  join_failed: "We couldn’t add you to the household. Please try again.",
};

export default async function JoinHouseholdPage({ params, searchParams }: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const code = (await params).code.trim().toLowerCase();
  const { error } = await searchParams;
  const service = getSupabaseServiceClient();
  const { data: household } = service
    ? await service.from("households").select("id,name").eq("invite_code", code).maybeSingle()
    : { data: null };

  if (!household) {
    return (
      <InviteSheet>
        <h1 className="font-display text-3xl text-ink">Invite not found</h1>
        <p className="text-sm text-ink-soft">This invitation link is invalid or no longer available.</p>
        <LinkButton href="/sign-in" variant="secondary">Go to sign in</LinkButton>
      </InviteSheet>
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) {
    return (
      <InviteSheet>
        <p className="journal-kicker">You’re invited</p>
        <h1 className="font-display text-3xl text-ink">Join {household.name}</h1>
        <p className="text-sm text-ink-soft">Sign in first, then you’ll return here to join the household.</p>
        <SignInForm next={`/join/${code}`} />
      </InviteSheet>
    );
  }

  const { data: membership } = await service!
    .from("household_members")
    .select("household_id")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership?.household_id === household.id) {
    return (
      <InviteSheet>
        <p className="journal-kicker">Already at this table</p>
        <h1 className="font-display text-3xl text-ink">You’re already a member of {household.name}</h1>
        <p className="text-sm text-ink-soft">
          Signed in as {user.email}. To test this invitation with another account, sign out first and reopen the invite.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/home">Go to the household</LinkButton>
          <SignOutButton redirectTo={`/join/${code}`} />
        </div>
      </InviteSheet>
    );
  }

  const defaultName = String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "");
  return (
    <InviteSheet>
      <p className="journal-kicker">You’re invited</p>
      <h1 className="font-display text-3xl text-ink">Join {household.name}</h1>
      <p className="text-sm text-ink-soft">You’ll share recipe ideas, weekly plans, shopping lists, and cooking memories.</p>
      {membership ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-xl border border-tomato/30 bg-tomato/10 p-4 text-sm text-tomato-dark">
            This account already belongs to another household. Multi-household switching is not part of the MVP yet.
          </p>
          <SignOutButton className="self-start" redirectTo={`/join/${code}`} />
        </div>
      ) : (
        <form action={acceptHouseholdInviteAction} className="flex flex-col gap-4">
          <input type="hidden" name="inviteCode" value={code} />
          <label>
            <span className={labelClass}>Your name</span>
            <input required name="displayName" defaultValue={defaultName} className={fieldClass} autoComplete="name" />
          </label>
          {error && <p className="text-sm text-tomato-dark">{INVITE_ERRORS[error] ?? INVITE_ERRORS.join_failed}</p>}
          <Button type="submit">Join this household</Button>
        </form>
      )}
      <p className="text-xs text-ink-soft">Signed in as {user.email}</p>
    </InviteSheet>
  );
}

function InviteSheet({ children }: { children: React.ReactNode }) {
  return <div className="auth-page"><section className="auth-sheet flex flex-col gap-4">{children}</section></div>;
}

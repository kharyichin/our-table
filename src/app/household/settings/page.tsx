import { getDemoHouseholdId, getHousehold, getHouseholdMembers, getTelegramLink } from "@/lib/data/household";
import { HouseholdNameEditor } from "@/components/household/HouseholdNameEditor";
import { InviteLinkBox } from "@/components/household/InviteLinkBox";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { MemberFoodPreferences } from "@/components/household/MemberFoodPreferences";
import { RemoveMemberButton } from "@/components/household/RemoveMemberButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { TelegramLinkManager } from "@/components/household/TelegramLinkManager";

export default async function HouseholdSettingsPage() {
  const householdId = await getDemoHouseholdId();
  const household = await getHousehold(householdId);
  if (!household) notFound();

  const [members, telegramLink] = await Promise.all([
    getHouseholdMembers(householdId),
    getTelegramLink(householdId),
  ]);
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const currentMember = members.find((member) => member.profileId === user?.id);
  const isOwner = currentMember?.role === "owner";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">Your household</p>
          <HouseholdNameEditor householdId={household.id} initialName={household.name} canEdit={isOwner} />
          <p className="mt-1 text-xs text-ink-soft">Created {formatDate(household.createdAt)}</p>
        </div>
        <SignOutButton className="shrink-0" />
      </div>

      <section className="paper-card mb-6 p-5">
        <h2 className="font-display mb-4 text-lg text-ink">Members</h2>
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.id} className="member-sheet">
              <div className="flex items-center gap-3">
                <Avatar src={m.profile?.avatarUrl} name={m.profile?.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{m.profile?.displayName ?? "Someone"}</p>
                  <p className="text-xs text-ink-soft">Joined {formatDate(m.joinedAt)}</p>
                </div>
                <span className="rounded-full bg-paper-warm px-2.5 py-1 text-xs font-semibold capitalize text-ink-soft">
                  {m.role}
                </span>
              </div>
              {m.profile && m.profileId === user?.id && <MemberFoodPreferences profile={m.profile} />}
              {isOwner && m.profileId !== user?.id && (
                <RemoveMemberButton householdId={household.id} memberId={m.id} memberName={m.profile?.displayName ?? "this member"} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Everyone in the household can add ideas, plan meals, and log memories together. Only the owner can rename the household.
        </p>
      </section>

      <section className="paper-card mb-6 p-5">
        <h2 className="font-display mb-2 text-lg text-ink">Invite someone</h2>
        <p className="mb-3 text-sm text-ink-soft">Share this link so a partner, roommate, or family member can join.</p>
        <InviteLinkBox inviteCode={household.inviteCode} />
      </section>

      <section className="paper-card p-5">
        <h2 className="font-display mb-2 text-lg text-ink">Telegram group</h2>
        <TelegramLinkManager
          householdId={household.id}
          link={telegramLink}
          canManage={isOwner}
          botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? null}
        />
        <p className="mt-3 text-xs text-ink-soft">
          One Telegram group connects to one household. Drop links, photos, and hashtagged notes there — planning still happens here in the app.
        </p>
      </section>
    </div>
  );
}

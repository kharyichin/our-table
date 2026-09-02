import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Avatar } from "@/components/ui/Avatar";
import { getProfiles } from "@/lib/data/household";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/home");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account");

  const [storedProfile] = await getProfiles([user.id]);
  const profile: Profile = storedProfile ?? {
    id: user.id,
    displayName: String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Table member"),
    avatarUrl: null,
    telegramUserId: null,
    dietaryPreferences: [],
    allergies: [],
    favouriteCuisines: [],
    createdAt: user.created_at,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-10 lg:py-12">
      <header className="account-bookplate mb-10 border-b border-line pb-8">
        <p className="journal-kicker">This copy belongs to</p>
        <div className="mt-4 flex items-center gap-4">
          <Avatar src={profile.avatarUrl} name={profile.displayName} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display truncate text-4xl text-ink sm:text-5xl">{profile.displayName}</h1>
            <p className="mt-1 truncate text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <section>
          <p className="journal-kicker">Food notes</p>
          <h2 className="font-display mb-6 mt-1 text-2xl text-ink">What should your household remember?</h2>
          <AccountProfileForm profile={profile} />
        </section>

        <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-soft">Account</p>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="text-xs text-ink-soft">Joined</dt><dd className="mt-1 font-semibold text-ink">{formatDate(profile.createdAt)}</dd></div>
            <div><dt className="text-xs text-ink-soft">Sign-in method</dt><dd className="mt-1 font-semibold text-ink">Email magic link</dd></div>
          </dl>
          <SignOutButton className="mt-6 w-full" />
          <Link href="/household/settings" className="mt-3 block text-center text-xs font-bold text-tomato-dark hover:underline">Household settings</Link>
          <details className="mt-6 border-t border-line pt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-ink">Delete account</summary>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">Guided export and deletion are planned before launch. For now, no data is removed automatically.</p>
          </details>
        </aside>
      </div>

      <footer className="mt-14 border-t-2 border-ink/15 pt-7">
        <p className="journal-kicker">Colophon & credits</p>
        <div className="mt-3 grid gap-4 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
          <p>Our Table is a household food journal built around shared recipes, weekly plans, and the memories that collect around them.</p>
          <p>
            International-food watercolor artwork, when integrated, is sourced from{" "}
            <Link className="font-semibold text-tomato-dark underline decoration-tomato/30 underline-offset-2" href="https://www.rawpixel.com/" target="_blank" rel="noreferrer">rawpixel.com</Link>
            {" "}/ Freepik. License confirmation remains pending; current interface illustrations and line icons are original project artwork.
          </p>
        </div>
      </footer>
    </div>
  );
}

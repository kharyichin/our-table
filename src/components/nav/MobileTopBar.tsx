"use client";

import Link from "next/link";
import { LineIcon } from "@/components/ui/LineIcon";
import { usePathname } from "next/navigation";

export function MobileTopBar({ householdName }: { householdName: string }) {
  const pathname = usePathname();
  if (pathname === "/sign-in" || pathname.startsWith("/onboarding")) return null;
  return (
    <header className="mobile-top flex items-center justify-between px-4 py-3 lg:hidden">
      <div>
        <p className="font-display text-base leading-none text-tomato-dark">Our Table</p>
        <p className="mt-0.5 text-[11px] text-ink-soft">{householdName}</p>
      </div>
      <Link
        href="/account"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-ink-soft"
        aria-label="Account and credits"
      >
        <LineIcon name="account" />
      </Link>
    </header>
  );
}

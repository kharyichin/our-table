"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { LineIcon } from "@/components/ui/LineIcon";

export function Sidebar({ householdName }: { householdName: string }) {
  const pathname = usePathname();
  if (pathname === "/sign-in" || pathname.startsWith("/onboarding")) return null;

  return (
    <aside className="kitchen-rail hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:px-5 lg:py-7">
      <div className="mb-8 px-3">
        <p className="font-display text-lg text-tomato-dark">Our Table</p>
        <p className="mt-0.5 truncate text-xs text-ink-soft">{householdName}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-tomato/12 text-tomato-dark" : "text-ink-soft hover:bg-paper hover:text-ink"
              )}
            >
              <LineIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 pt-6 text-xs text-ink-soft/70">
        Turn the meals we discover and cook into a story we can keep.
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { LineIcon } from "@/components/ui/LineIcon";

export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname === "/sign-in" || pathname.startsWith("/onboarding")) return null;

  return (
    <nav className="mobile-tab fixed inset-x-0 bottom-0 z-20 flex pb-[env(safe-area-inset-bottom)] lg:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
              active ? "text-tomato-dark" : "text-ink-soft"
            )}
          >
            <LineIcon name={item.icon} className="h-[21px] w-[21px]" />
            {item.label === "Idea Garden" ? "Ideas" : item.label === "Grocery Finds" ? "Finds" : item.label === "Memory Book" ? "Memories" : item.label}
          </Link>
        );
      })}
    </nav>
  );
}

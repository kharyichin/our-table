import type { IconName } from "@/components/ui/LineIcon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/ideas", label: "Idea Garden", icon: "sprout" },
  { href: "/week", label: "This Week", icon: "book" },
  { href: "/finds", label: "Grocery Finds", icon: "finds" },
  { href: "/shopping", label: "Shopping", icon: "basket" },
  { href: "/memories", label: "Memory Book", icon: "memory" },
  { href: "/household/settings", label: "Household", icon: "household" },
  { href: "/account", label: "Account & credits", icon: "account" },
];

// A smaller set for the mobile tab bar — settings lives one tap away instead.
export const MOBILE_NAV_ITEMS: NavItem[] = NAV_ITEMS.slice(0, 6);

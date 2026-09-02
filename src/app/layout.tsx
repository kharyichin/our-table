import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { MobileTopBar } from "@/components/nav/MobileTopBar";
import { getDemoHouseholdId, getHousehold } from "@/lib/data/household";
import { PwaRegister } from "@/components/PwaRegister";
import { CookbookExperience } from "@/components/CookbookExperience";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Our Table",
  description: "Turn the meals we discover and cook into a story we can keep.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Our Table" },
};

export const viewport: Viewport = {
  themeColor: "#faf1e2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let householdName = "Our Table";
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase!.auth.getUser();
    if (user) {
      const { data: membership } = await supabase!
        .from("household_members")
        .select("households(name)")
        .eq("profile_id", user.id)
        .limit(1)
        .maybeSingle();
      const linkedHousehold = membership?.households as { name?: string } | null;
      householdName = linkedHousehold?.name ?? householdName;
    }
  } else {
    const householdId = await getDemoHouseholdId();
    const household = await getHousehold(householdId);
    householdName = household?.name ?? householdName;
  }

  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${fredoka.variable} ${nunito.variable} antialiased`}>
        <div className="relative z-10 flex min-h-screen">
          <Sidebar householdName={householdName} />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileTopBar householdName={householdName} />
            <main className="flex-1 pb-20 lg:pb-0"><CookbookExperience>{children}</CookbookExperience></main>
          </div>
        </div>
        <MobileTabBar />
        <PwaRegister />
      </body>
    </html>
  );
}

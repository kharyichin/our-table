"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const INTRO_KEY = "our-table-cookbook-opened";

export function CookbookExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [firstOpen, setFirstOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/home" || window.sessionStorage.getItem(INTRO_KEY)) return;
    setFirstOpen(true);
    window.sessionStorage.setItem(INTRO_KEY, "true");
    const timer = window.setTimeout(() => setFirstOpen(false), 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="cookbook-stage">
      <div key={pathname} className={`cookbook-page${firstOpen ? " is-first-open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

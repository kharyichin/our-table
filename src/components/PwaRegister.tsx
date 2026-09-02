"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "development") {
      // A cached app shell can make a stopped dev server look like an older,
      // working build. Keep localhost honest: development always reflects
      // the currently running source and never the production PWA cache.
      navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );
      if ("caches" in window) {
        caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("our-table-")).map((key) => caches.delete(key))));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline shell is a nice-to-have — don't surface registration failures to the user.
    });
  }, []);
  return null;
}

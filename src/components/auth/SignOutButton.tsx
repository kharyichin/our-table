"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignOutButton({ className, redirectTo = "/sign-in" }: { className?: string; redirectTo?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button variant="secondary" className={className} disabled={pending} onClick={() => startTransition(async () => {
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  })}>{pending ? "Signing out…" : "Sign out"}</Button>;
}

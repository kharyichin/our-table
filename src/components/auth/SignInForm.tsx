"use client";

import { useState, useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/form";

const ERRORS: Record<string, string> = {
  invalid_link: "That sign-in link is incomplete. Request a new one below.",
  expired_link: "That sign-in link has expired or was already used. Request a new one below.",
  session_failed: "The link opened, but the session could not be created. Request a new one.",
};

function describeAuthError(message: string, status?: number) {
  if (status === 429 || message.toLowerCase().includes("rate limit")) {
    return "Too many sign-in emails were requested. Wait at least 60 seconds without retrying, then request one new link. If it still fails, check the project’s Auth rate limits.";
  }

  return message;
}

export function SignInForm({ initialError, next = "/home" }: { initialError?: string; next?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(initialError ? ERRORS[initialError] ?? "Sign-in could not be completed." : null);
  const [pending, startTransition] = useTransition();

  return (
    <form className="mt-7 flex flex-col gap-4" onSubmit={(event) => {
      event.preventDefault();
      setError(null);
      startTransition(async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return setError("Supabase is not configured.");
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", next);
        const callback = callbackUrl.toString();
        const { error: authError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback } });
        if (authError) return setError(describeAuthError(authError.message, authError.status));
        setSent(true);
      });
    }}>
      {sent ? (
        <div className="rounded-xl border border-basil/30 bg-basil/10 p-4 text-sm text-basil-dark">
          Check <strong>{email}</strong> for your sign-in link. You can close this page after opening the email.
        </div>
      ) : (
        <>
          <label>
            <span className={labelClass}>Email address</span>
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} placeholder="you@example.com" />
          </label>
          {error && <p className="text-sm text-tomato-dark">{error}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Sending link…" : "Email me a sign-in link"}</Button>
        </>
      )}
    </form>
  );
}

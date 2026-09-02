"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export type MutationMessage = { tone: "success" | "error"; message: string } | null;

export function useMutationFeedback() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<MutationMessage>(null);
  function run(action: () => Promise<void>, options: { success?: string; fallbackError?: string } = {}) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await action();
        if (options.success) setFeedback({ tone: "success", message: options.success });
      } catch (error) {
        setFeedback({ tone: "error", message: error instanceof Error ? error.message : options.fallbackError ?? "That change could not be saved." });
      }
    });
  }
  return { pending, feedback, run, clearFeedback: () => setFeedback(null) };
}

export function MutationFeedback({ feedback, pending, pendingMessage = "Saving…", className }: {
  feedback: MutationMessage; pending?: boolean; pendingMessage?: string; className?: string;
}) {
  const message = pending ? pendingMessage : feedback?.message;
  if (!message) return null;
  return <p role={feedback?.tone === "error" ? "alert" : "status"} aria-live="polite" className={cn("text-xs font-semibold", pending ? "text-ink-soft" : feedback?.tone === "error" ? "text-tomato-dark" : "text-basil-dark", className)}>{message}</p>;
}

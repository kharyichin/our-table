"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function InviteLinkBox({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${window.location.origin}/join/${inviteCode}`);
  }, [inviteCode]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-xl border border-line bg-paper-warm/50 px-3 py-2 text-sm text-ink-soft">
        {link || `…/join/${inviteCode}`}
      </code>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard API can be unavailable (e.g. insecure context) — silently no-op.
          }
        }}
      >
        {copied ? "Copied ✓" : "Copy invite link"}
      </Button>
    </div>
  );
}

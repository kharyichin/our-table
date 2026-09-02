"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MutationFeedback, useMutationFeedback } from "@/components/ui/MutationFeedback";
import { createTelegramLinkCodeAction, disconnectTelegramAction } from "@/app/household/settings/actions";
import type { TelegramLink } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { LineIcon } from "@/components/ui/LineIcon";

export function TelegramLinkManager({ householdId, link, canManage, botUsername }: {
  householdId: string;
  link: TelegramLink | null;
  canManage: boolean;
  botUsername: string | null;
}) {
  const router = useRouter();
  const [command, setCommand] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { pending, feedback, run } = useMutationFeedback();

  if (link) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <LineIcon name="household" className="text-tomato-dark" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{link.chatTitle ?? "Connected group"}</p>
            <p className="text-xs text-ink-soft">Connected {formatDate(link.linkedAt)}</p>
          </div>
          {canManage && (
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => run(async () => {
              await disconnectTelegramAction(householdId);
              setCommand(null);
              router.refresh();
            }, { success: "Telegram group disconnected." })}>
              Disconnect
            </Button>
          )}
        </div>
        <MutationFeedback feedback={feedback} pending={pending} pendingMessage="Updating the connection…" className="mt-3" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Connect the group where your household already shares recipes and grocery discoveries. Linking codes expire after 15 minutes.
      </p>
      {canManage ? (
        <div className="mt-4">
          {botUsername && (
            <a href={`https://t.me/${botUsername}?startgroup=true`} target="_blank" rel="noreferrer" className="mb-3 inline-block text-sm font-semibold text-tomato-dark hover:underline">
              Add the Our Table bot to a group
            </a>
          )}
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-xs text-ink-soft">
            <li>Add the Our Table bot to the Telegram group.</li>
            <li>Generate a one-time command here.</li>
            <li>Send that command inside the group, then return and check the connection.</li>
          </ol>
          {command && (
            <div className="mb-3 rounded-xl border border-line bg-paper-warm/60 p-3">
              <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-wide text-ink-soft">Send this in your Telegram group</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 select-all break-all text-sm font-semibold text-ink">{command}</code>
                <Button type="button" variant="secondary" size="sm" onClick={async () => {
                  await navigator.clipboard.writeText(command);
                  setCopied(true);
                }}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => run(async () => {
              const result = await createTelegramLinkCodeAction(householdId);
              setCommand(result.command);
              setCopied(false);
            }, { success: "One-time Telegram command created." })}>
              {command ? "Generate a new code" : "Generate linking code"}
            </Button>
            {command && <Button variant="secondary" size="sm" onClick={() => router.refresh()}>Check connection</Button>}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">The household owner can connect a Telegram group.</p>
      )}
      <MutationFeedback feedback={feedback} pending={pending} pendingMessage="Preparing the connection…" className="mt-3" />
    </div>
  );
}

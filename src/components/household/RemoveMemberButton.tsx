"use client";

import { useState, useTransition } from "react";
import { removeHouseholdMemberAction } from "@/app/household/settings/actions";
import { Button } from "@/components/ui/Button";

export function RemoveMemberButton({ householdId, memberId, memberName }: { householdId: string; memberId: string; memberName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="mt-3 flex flex-col items-start gap-2 sm:items-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Remove ${memberName} from this household?`)) return;
          setError(null);
          startTransition(async () => {
            try {
              await removeHouseholdMemberAction(householdId, memberId);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "This member could not be removed.");
            }
          });
        }}
      >
        {pending ? "Removing…" : "Remove member"}
      </Button>
      {error && <p className="text-xs text-tomato-dark">{error}</p>}
    </div>
  );
}

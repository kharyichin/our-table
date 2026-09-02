import { cn } from "@/lib/utils";
import type { RecipeStatus } from "@/lib/types";

const STATUS_CONFIG: Record<RecipeStatus, { label: string; className: string }> = {
  idea: { label: "Idea", className: "bg-[var(--butter)]/25 text-[var(--butter-dark)]" },
  planned: { label: "Planned", className: "bg-[var(--squash)]/20 text-[var(--squash-dark)]" },
  cooked: { label: "Cooked", className: "bg-[var(--basil)]/20 text-[var(--basil-dark)]" },
  repeated: { label: "Repeated", className: "bg-[var(--blueberry)]/20 text-[var(--blueberry-dark)]" },
  archived: { label: "Archived", className: "bg-[var(--ink-soft)]/15 text-[var(--ink-soft)]" },
};

export function StatusPill({ status, className }: { status: RecipeStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

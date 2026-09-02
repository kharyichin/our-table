import { cn } from "@/lib/utils";
import { LineIcon, type IconName } from "@/components/ui/LineIcon";

export function EmptyState({
  icon = "plate",
  title,
  body,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "paper-card wobble-1 flex flex-col items-center gap-3 px-8 py-14 text-center",
        className
      )}
    >
      <div className="empty-state-mark"><LineIcon name={icon} className="h-8 w-8" /></div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {body && <p className="max-w-sm text-sm text-ink-soft">{body}</p>}
      {action}
    </div>
  );
}

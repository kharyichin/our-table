import { cn } from "@/lib/utils";

const TAG_STYLES: Record<string, string> = {
  cuisine: "bg-[var(--blueberry)]/12 text-[var(--blueberry-dark)] border-[var(--blueberry)]/30",
  ingredient: "bg-[var(--basil)]/12 text-[var(--basil-dark)] border-[var(--basil)]/30",
  neutral: "bg-[var(--paper-warm)] text-[var(--ink-soft)] border-[var(--line)]",
};

export function Tag({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof TAG_STYLES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TAG_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

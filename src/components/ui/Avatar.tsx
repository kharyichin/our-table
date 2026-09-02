import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-14 w-14 text-base" }[size];
  const initials = (name ?? "Table").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      title={name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-paper bg-paper-warm shadow-sm",
        sizeClasses,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span aria-hidden className="font-bold tracking-wide">{initials}</span>
      )}
    </div>
  );
}

export function AvatarStack({ members }: { members: { avatarUrl?: string | null; name: string }[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map((m) => (
        <Avatar key={m.name} src={m.avatarUrl} name={m.name} size="sm" />
      ))}
    </div>
  );
}

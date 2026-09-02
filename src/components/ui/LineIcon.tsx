import { cn } from "@/lib/utils";

export type IconName = "home" | "sprout" | "book" | "finds" | "basket" | "memory" | "household" | "account" | "plate" | "inbox" | "pencil";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/></>,
  sprout: <><path d="M12 21v-9"/><path d="M12 13C7.5 13 5 10.4 5 6c4.5 0 7 2.5 7 7Z"/><path d="M12 16c4.5 0 7-2.6 7-7-4.5 0-7 2.5-7 7Z"/></>,
  book: <><path d="M4 5.5c3.3-.8 5.9-.2 8 1.7v12c-2.1-1.9-4.7-2.5-8-1.7Z"/><path d="M20 5.5c-3.3-.8-5.9-.2-8 1.7v12c2.1-1.9 4.7-2.5 8-1.7Z"/></>,
  finds: <><path d="M4 5h9l7 7-8 8-8-8Z"/><circle cx="9" cy="10" r="1.5"/></>,
  basket: <><path d="m5 10 2.2 9h9.6L19 10Z"/><path d="M3.5 10h17M8 10l4-6 4 6M9 13v3M15 13v3"/></>,
  memory: <><path d="M6 3.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 1-2Z"/><path d="M8 3.5V20M11 8h5M11 12h5"/></>,
  household: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.3-4 2.2-6 5.5-6s5.2 2 5.5 6M14 15c3.7-.8 6 .8 6.5 4.5"/></>,
  account: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.4-4.5 2.7-6.7 7-6.7s6.6 2.2 7 6.7"/></>,
  plate: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><path d="M3 5v6M5 5v6M4 11v8M20 5c-2 2.6-2 5.2 0 7v7"/></>,
  inbox: <><path d="M4 5h16v14H4Z"/><path d="M4 14h4l2 2h4l2-2h4"/></>,
  pencil: <><path d="m5 19 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18Z"/><path d="m14.5 6.5 3 3"/></>,
};

export function LineIcon({ name, className }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5", className)} aria-hidden="true">{paths[name]}</svg>;
}

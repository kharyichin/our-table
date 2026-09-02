import Link from "next/link";

function shiftWeek(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function weekRange(date: string): string {
  const start = new Date(`${date}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startLabel}–${endLabel}`;
}

export function WeekNavigator({ weekStartDate, isCurrent, view = "story" }: { weekStartDate: string; isCurrent: boolean; view?: "story" | "calendar" }) {
  const previous = shiftWeek(weekStartDate, -7);
  const next = shiftWeek(weekStartDate, 7);
  return (
    <nav className="chapter-ribbon" aria-label="Browse weekly chapters">
      <Link className="chapter-turn" href={`/week?date=${previous}${view === "calendar" ? "&view=calendar" : ""}`} aria-label="Previous week">
        <span aria-hidden>←</span><span><strong>Previous week</strong><small>{weekRange(previous)}</small></span>
      </Link>
      <div className="chapter-view-switch">
        <Link href={`/week?date=${weekStartDate}`} className={view === "story" ? "is-active" : ""}>Story</Link>
        <Link href={`/week?date=${weekStartDate}&view=calendar`} className={view === "calendar" ? "is-active" : ""}>Calendar</Link>
        {!isCurrent && <Link href="/week" className="chapter-ribbon-current">Today</Link>}
      </div>
      <Link className="chapter-turn chapter-turn-next" href={`/week?date=${next}${view === "calendar" ? "&view=calendar" : ""}`} aria-label="Next week">
        <span><strong>Next week</strong><small>{weekRange(next)}</small></span><span aria-hidden>→</span>
      </Link>
    </nav>
  );
}

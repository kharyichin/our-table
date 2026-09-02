import Link from "next/link";
import { DAY_LABELS, type MealCard, type Recipe } from "@/lib/types";

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mondayOf(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + ((day === 0 ? -6 : 1) - day));
  return copy;
}

export function WeekCalendar({ weekStartDate, mealCards, recipes }: { weekStartDate: string; mealCards: MealCard[]; recipes: Recipe[] }) {
  const selectedStart = new Date(`${weekStartDate}T12:00:00`);
  const selectedEnd = new Date(selectedStart);
  selectedEnd.setDate(selectedStart.getDate() + 6);
  const monthStart = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1, 12);
  const gridStart = mondayOf(monthStart);
  const days = Array.from({ length: 42 }, (_, index) => {
    const value = new Date(gridStart);
    value.setDate(gridStart.getDate() + index);
    return value;
  });
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return (
    <section className="month-calendar" aria-label={`Calendar for ${selectedStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="chapter-kicker">The month at a glance</p>
          <h2 className="font-display text-3xl text-ink">{selectedStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
        </div>
        <p className="max-w-sm text-right text-sm text-ink-soft">Select any day to open that week’s chapter.</p>
      </div>
      <div className="calendar-grid">
        {DAY_LABELS.map((day) => <div key={day} className="calendar-weekday">{day}</div>)}
        {days.map((day, index) => {
          const dateIso = iso(day);
          const inSelectedWeek = day >= selectedStart && day <= selectedEnd;
          const inMonth = day.getMonth() === selectedStart.getMonth();
          const dayIndex = index % 7;
          const card = inSelectedWeek ? mealCards.find((item) => item.dayIndex === dayIndex) : undefined;
          const recipe = card?.recipeId ? recipeById.get(card.recipeId) : undefined;
          return (
            <Link
              key={dateIso}
              href={`/week?date=${dateIso}`}
              className={`calendar-day ${inSelectedWeek ? "is-selected-week" : ""} ${!inMonth ? "is-outside-month" : ""}`}
              aria-label={`Open week containing ${day.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
            >
              <span className="calendar-date">{day.getDate()}</span>
              {recipe && <span className="calendar-meal">{recipe.title}</span>}
              {card && !recipe && card.state !== "planned" && <span className="calendar-meal">{card.state === "eating_out" ? "Eating out" : card.state}</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";

interface Option { value: string; label: string }

export function MemoryBookFilters({
  years,
  cuisines,
  ingredients,
  members,
  selected,
}: {
  years: string[];
  cuisines: string[];
  ingredients: string[];
  members: Option[];
  selected: { year?: string; cuisine?: string; ingredient?: string; member?: string };
}) {
  const router = useRouter();

  function update(key: string, value: string) {
    const params = new URLSearchParams();
    const next = { ...selected, [key]: value || undefined };
    for (const [name, entry] of Object.entries(next)) if (entry) params.set(name, entry);
    router.push(`/memories${params.size ? `?${params.toString()}` : ""}`);
  }

  const hasFilter = Object.values(selected).some(Boolean);
  return (
    <div className="memory-filter-strip">
      <span className="memory-filter-label">Browse the book by</span>
      <select aria-label="Filter memories by year" value={selected.year ?? ""} onChange={(event) => update("year", event.target.value)}>
        <option value="">Every year</option>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
      <select aria-label="Filter memories by cuisine" value={selected.cuisine ?? ""} onChange={(event) => update("cuisine", event.target.value)}>
        <option value="">Every cuisine</option>
        {cuisines.map((value) => <option key={value} value={value}>#{value}</option>)}
      </select>
      <select aria-label="Filter memories by ingredient" value={selected.ingredient ?? ""} onChange={(event) => update("ingredient", event.target.value)}>
        <option value="">Every ingredient</option>
        {ingredients.map((value) => <option key={value} value={value}>#{value}</option>)}
      </select>
      <select aria-label="Filter memories by household member" value={selected.member ?? ""} onChange={(event) => update("member", event.target.value)}>
        <option value="">Everyone</option>
        {members.map((member) => <option key={member.value} value={member.value}>{member.label}</option>)}
      </select>
      {hasFilter && <button onClick={() => router.push("/memories")}>Clear filters</button>}
    </div>
  );
}

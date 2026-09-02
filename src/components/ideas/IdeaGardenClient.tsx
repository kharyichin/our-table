"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { createRecipeAction } from "@/app/recipes/actions";
import type { Recipe, RecipeStatus } from "@/lib/types";

const STATUS_ORDER: RecipeStatus[] = ["idea", "planned", "cooked", "repeated", "archived"];
const WOBBLES = ["wobble-1", "wobble-2", "wobble-3"];

export function IdeaGardenClient({
  recipes,
  members,
}: {
  recipes: Recipe[];
  members: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach((r) => [...r.cuisineTags, ...r.ingredientTags].forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [recipes]);

  const filtered = recipes.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (tagFilter && !r.cuisineTags.includes(tagFilter) && !r.ingredientTags.includes(tagFilter)) return false;
    if (query) {
      const haystack = `${r.title} ${r.description ?? ""} ${r.cuisineTags.join(" ")} ${r.ingredientTags.join(" ")}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ideas, ingredients, cuisines…"
          className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2 text-sm focus:border-tomato focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RecipeStatus | "all")}
          className="rounded-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <Button onClick={() => setShowNew(true)}>+ New idea</Button>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <button onClick={() => setTagFilter(null)}>
            <Tag variant={tagFilter === null ? "cuisine" : "neutral"}>All tags</Tag>
          </button>
          {allTags.map((t) => (
            <button key={t} onClick={() => setTagFilter(t === tagFilter ? null : t)}>
              <Tag variant={tagFilter === t ? "cuisine" : "neutral"}>#{t}</Tag>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="sprout"
          title={recipes.length === 0 ? "The garden is empty" : "Nothing matches"}
          body={
            recipes.length === 0
              ? "Recipe ideas from your Telegram group will sprout up here, or plant the first one yourself."
              : "Try a different search or clear your filters."
          }
          action={recipes.length === 0 && <Button onClick={() => setShowNew(true)}>Plant an idea</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} wobble={WOBBLES[i % WOBBLES.length]} />
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Plant a new idea" wide>
        <RecipeForm
          members={members}
          onSubmit={createRecipeAction}
          onDone={() => {
            setShowNew(false);
            router.refresh();
          }}
          submitLabel="Add to garden"
        />
      </Modal>
    </div>
  );
}

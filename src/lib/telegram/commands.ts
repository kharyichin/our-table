import { listRecipes } from "@/lib/data/recipes";
import { getOrCreateCurrentWeeklyPlan, listMealCards } from "@/lib/data/weeklyPlans";
import { getOrCreateShoppingList, listShoppingItems } from "@/lib/data/shoppingLists";
import { listCookingMemories } from "@/lib/data/cookingMemories";
import { DAY_LABELS_FULL } from "@/lib/types";

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

// Telegram is for capture and light interaction only — every reply here
// summarizes and links back to the web app rather than trying to replace it.
export async function handleCommand(command: string, householdId: string): Promise<string> {
  switch (command) {
    case "/help":
      return [
        "<b>Our Table bot</b>",
        "",
        "Drop links, photos, or notes in this group and I'll save them as recipe ideas or grocery finds. Tag ingredients and cuisines with hashtags, like #chicken #japanese.",
        "",
        "<b>Commands</b>",
        "/thisweek — see this week's meal plan",
        "/ideas — recent recipe ideas",
        "/shopping — the current shopping list",
        "/memories — recent cooking memories",
        "",
        `Full planning happens in the app: ${appUrl("/home")}`,
      ].join("\n");

    case "/thisweek": {
      const plan = await getOrCreateCurrentWeeklyPlan(householdId);
      const cards = await listMealCards(plan.id);
      const recipes = await listRecipes(householdId);
      const recipeTitle = (id: string | null) => recipes.find((r) => r.id === id)?.title ?? null;

      const lines = [`<b>${escapeHtml(plan.chapterTitle)}</b>`, ""];
      for (let day = 0; day < 7; day++) {
        const card = cards.find((c) => c.dayIndex === day);
        const label = DAY_LABELS_FULL[day];
        if (!card) {
          lines.push(`${label}: <i>not planned yet</i>`);
        } else if (card.state === "eating_out") {
          lines.push(`${label}: Eating out${card.note ? ` — ${escapeHtml(card.note)}` : ""}`);
        } else if (card.state === "skipped") {
          lines.push(`${label}: — skipped${card.note ? ` (${escapeHtml(card.note)})` : ""}`);
        } else {
          const title = recipeTitle(card.recipeId) ?? "Untitled";
          const stateLabel = { planned: "Planned", cooked: "Cooked", replaced: "Replaced" }[card.state] ?? "";
          lines.push(`${label}: ${stateLabel} — ${escapeHtml(title)}`);
        }
      }
      lines.push("", `Full week: ${appUrl("/week")}`);
      return lines.join("\n");
    }

    case "/ideas": {
      const recipes = (await listRecipes(householdId)).filter((r) => r.status === "idea").slice(0, 8);
      if (recipes.length === 0) {
        return `No ideas saved yet. Share a link or a hashtag'd note in the group and I'll start the garden. ${appUrl("/ideas")}`;
      }
      const lines = ["<b>Recipe ideas</b>", ""];
      for (const r of recipes) {
        const tags = [...r.cuisineTags, ...r.ingredientTags].map((t) => `#${t}`).join(" ");
        lines.push(`• ${escapeHtml(r.title)}${tags ? ` — ${escapeHtml(tags)}` : ""}`);
      }
      lines.push("", `Browse the Idea Garden: ${appUrl("/ideas")}`);
      return lines.join("\n");
    }

    case "/shopping": {
      const plan = await getOrCreateCurrentWeeklyPlan(householdId);
      const list = await getOrCreateShoppingList(plan.id);
      const items = (await listShoppingItems(list.id)).filter((i) => !i.checked && !i.haveIt);
      if (items.length === 0) {
        return `Shopping list is all clear — nothing outstanding. ${appUrl("/shopping")}`;
      }
      const lines = ["<b>Shopping list</b>", ""];
      for (const item of items.slice(0, 15)) {
        lines.push(`☐ ${escapeHtml(item.name)}${item.quantity ? ` (${escapeHtml(item.quantity)})` : ""}`);
      }
      if (items.length > 15) lines.push(`…and ${items.length - 15} more`);
      lines.push("", `Full list: ${appUrl("/shopping")}`);
      return lines.join("\n");
    }

    case "/memories": {
      const memories = (await listCookingMemories(householdId)).slice(0, 5);
      if (memories.length === 0) {
        return `No cooking memories logged yet. Cook something and log it in the app to start the Memory Book. ${appUrl("/memories")}`;
      }
      const recipes = await listRecipes(householdId);
      const lines = ["<b>Recent memories</b>", ""];
      for (const m of memories) {
        const title = recipes.find((r) => r.id === m.recipeId)?.title ?? "A recipe";
        const stars = m.rating ? "⭐".repeat(m.rating) : "";
        lines.push(`• ${escapeHtml(title)} — ${m.dateCooked} ${stars}`);
      }
      lines.push("", `Memory Book: ${appUrl("/memories")}`);
      return lines.join("\n");
    }

    default:
      return "Unknown command. Try /help to see what I can do.";
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

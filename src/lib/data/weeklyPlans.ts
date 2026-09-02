/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase rows are mapped by hand here; typing every column would need generated types. */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { demoStore, nextId } from "./store";
import type { MealCard, MealState, WeeklyPlan } from "@/lib/types";

function mapPlanRow(row: any): WeeklyPlan {
  return {
    id: row.id,
    householdId: row.household_id,
    chapterTitle: row.chapter_title,
    weeklyMemory: row.weekly_memory ?? null,
    weekStartDate: row.week_start_date,
    createdAt: row.created_at,
  };
}

function mapMealRow(row: any): MealCard {
  return {
    id: row.id,
    weeklyPlanId: row.weekly_plan_id,
    dayIndex: row.day_index,
    recipeId: row.recipe_id,
    state: row.state,
    note: row.note,
    createdAt: row.created_at,
  };
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getOrCreateCurrentWeeklyPlan(householdId: string): Promise<WeeklyPlan> {
  const weekStartDate = startOfWeek(new Date()).toISOString().slice(0, 10);
  return getOrCreateWeeklyPlanForDate(householdId, weekStartDate);
}

export async function getOrCreateWeeklyPlanForDate(householdId: string, date: string): Promise<WeeklyPlan> {
  const parsed = new Date(`${date}T12:00:00`);
  const weekStartDate = startOfWeek(Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString().slice(0, 10);

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data: existing } = await supabase!
      .from("weekly_plans")
      .select("*")
      .eq("household_id", householdId)
      .eq("week_start_date", weekStartDate)
      .maybeSingle();
    if (existing) return mapPlanRow(existing);

    const { data, error } = await supabase!
      .from("weekly_plans")
      .insert({ household_id: householdId, week_start_date: weekStartDate, chapter_title: "This Week's Chapter" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPlanRow(data);
  }

  const existing = demoStore.weeklyPlans.find(
    (p) => p.householdId === householdId && p.weekStartDate === weekStartDate
  );
  if (existing) return existing;

  const plan: WeeklyPlan = {
    id: nextId("wp"),
    householdId,
    chapterTitle: "This Week's Chapter",
    weeklyMemory: null,
    weekStartDate,
    createdAt: new Date().toISOString(),
  };
  demoStore.weeklyPlans.push(plan);
  return plan;
}

export async function updateWeeklyMemory(planId: string, weeklyMemory: string | null): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!.from("weekly_plans").update({ weekly_memory: weeklyMemory }).eq("id", planId);
    if (error) throw new Error(error.message);
    return;
  }
  const plan = demoStore.weeklyPlans.find((item) => item.id === planId);
  if (plan) plan.weeklyMemory = weeklyMemory;
}

export async function getWeeklyPlan(id: string): Promise<WeeklyPlan | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!.from("weekly_plans").select("*").eq("id", id).maybeSingle();
    return data ? mapPlanRow(data) : null;
  }
  return demoStore.weeklyPlans.find((p) => p.id === id) ?? null;
}

export async function updateChapterTitle(planId: string, chapterTitle: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("weekly_plans").update({ chapter_title: chapterTitle }).eq("id", planId);
    return;
  }
  const plan = demoStore.weeklyPlans.find((p) => p.id === planId);
  if (plan) plan.chapterTitle = chapterTitle;
}

export async function listMealCards(planId: string): Promise<MealCard[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase!
      .from("meal_cards")
      .select("*")
      .eq("weekly_plan_id", planId)
      .order("day_index", { ascending: true });
    return (data ?? []).map(mapMealRow);
  }
  return demoStore.mealCards
    .filter((m) => m.weeklyPlanId === planId)
    .sort((a, b) => a.dayIndex - b.dayIndex);
}

export async function upsertMealCard(
  planId: string,
  dayIndex: number,
  patch: { recipeId?: string | null; state?: MealState; note?: string | null }
): Promise<MealCard> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data: existing } = await supabase!
      .from("meal_cards")
      .select("*")
      .eq("weekly_plan_id", planId)
      .eq("day_index", dayIndex)
      .maybeSingle();

    const row = {
      weekly_plan_id: planId,
      day_index: dayIndex,
      recipe_id: patch.recipeId !== undefined ? patch.recipeId : existing?.recipe_id ?? null,
      state: patch.state ?? existing?.state ?? "planned",
      note: patch.note !== undefined ? patch.note : existing?.note ?? null,
    };

    if (existing) {
      const { data } = await supabase!.from("meal_cards").update(row).eq("id", existing.id).select("*").single();
      return mapMealRow(data);
    }
    const { data, error } = await supabase!.from("meal_cards").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return mapMealRow(data);
  }

  let card = demoStore.mealCards.find((m) => m.weeklyPlanId === planId && m.dayIndex === dayIndex);
  if (!card) {
    card = {
      id: nextId("mc"),
      weeklyPlanId: planId,
      dayIndex,
      recipeId: null,
      state: "planned",
      note: null,
      createdAt: new Date().toISOString(),
    };
    demoStore.mealCards.push(card);
  }
  if (patch.recipeId !== undefined) card.recipeId = patch.recipeId;
  if (patch.state !== undefined) card.state = patch.state;
  if (patch.note !== undefined) card.note = patch.note;
  return card;
}

export async function clearMealCard(planId: string, dayIndex: number): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    await supabase!.from("meal_cards").delete().eq("weekly_plan_id", planId).eq("day_index", dayIndex);
    return;
  }
  const idx = demoStore.mealCards.findIndex((m) => m.weeklyPlanId === planId && m.dayIndex === dayIndex);
  if (idx >= 0) demoStore.mealCards.splice(idx, 1);
}

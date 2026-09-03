// Core domain types for Our Table. These mirror supabase/migrations/0001_init.sql.

export type RecipeStatus = "idea" | "planned" | "cooked" | "repeated" | "archived";
export type MealState = "planned" | "cooked" | "skipped" | "replaced" | "eating_out";
export type CaptureStatus =
  | "draft_recipe"
  | "draft_grocery_find"
  | "needs_review"
  | "dismissed"
  | "linked";
export type HouseholdRole = "owner" | "member";
export type WouldMakeAgain = "yes" | "no" | "maybe";

export const GROCERY_STORES = ["Safeway", "99 Ranch", "Target", "Trader Joe's"] as const;
export type GroceryStore = (typeof GROCERY_STORES)[number];

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  telegramUserId: number | null;
  dietaryPreferences: string[];
  allergies: string[];
  favouriteCuisines: string[];
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  profileId: string;
  role: HouseholdRole;
  joinedAt: string;
  profile?: Profile;
}

export interface TelegramLink {
  id: string;
  householdId: string;
  telegramChatId: number;
  chatTitle: string | null;
  linkedAt: string;
}

export interface Recipe {
  id: string;
  householdId: string;
  title: string;
  sourceUrl: string | null;
  description: string | null;
  servings: string | null;
  sourceImageUrl: string | null;
  ingredients: string[];
  instructions: string | null;
  cuisineTags: string[];
  ingredientTags: string[];
  illustrationSeed: string;
  status: RecipeStatus;
  discoveredDate: string;
  discoveredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryFind {
  id: string;
  householdId: string;
  store: string;
  ingredient: string;
  price: number | null;
  description: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  expiryDate: string | null;
  createdBy: string | null;
  createdAt: string;
  relatedRecipeIds: string[];
}

export type GroceryFindLifecycle = "active" | "history" | "expired";

export interface GroceryFindWithLifecycle extends GroceryFind {
  lifecycle: GroceryFindLifecycle;
}

export interface WeeklyPlan {
  id: string;
  householdId: string;
  chapterTitle: string;
  weeklyMemory: string | null;
  weekStartDate: string;
  createdAt: string;
}

export interface MealCard {
  id: string;
  weeklyPlanId: string;
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  recipeId: string | null;
  state: MealState;
  note: string | null;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  weeklyPlanId: string;
  generatedAt: string;
}

export interface ShoppingItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string | null;
  category: string;
  store: string | null;
  haveIt: boolean;
  checked: boolean;
  substitution: string | null;
  sourceMealCardIds: string[];
  isManual: boolean;
  createdAt: string;
}

export interface CookingMemory {
  id: string;
  householdId: string;
  recipeId: string;
  mealCardId: string | null;
  dateCooked: string;
  membersPresent: string[];
  photoUrl: string | null;
  note: string | null;
  rating: number | null;
  wouldMakeAgain: WouldMakeAgain;
  changesMade: string | null;
  occasion: string | null;
  createdAt: string;
}

export interface Capture {
  id: string;
  householdId: string;
  telegramChatId: number;
  telegramMessageId: number;
  senderName: string | null;
  rawText: string | null;
  urls: string[];
  imageUrls: string[];
  hashtags: string[];
  messageLink: string | null;
  status: CaptureStatus;
  linkedRecipeId: string | null;
  linkedGroceryFindId: string | null;
  createdAt: string;
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DAY_LABELS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

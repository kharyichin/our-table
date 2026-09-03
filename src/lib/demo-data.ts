// In-memory demo dataset used whenever Supabase env vars are not configured.
// Mirrors supabase/seed.sql so the product is fully explorable out of the box.
// See src/lib/data/store.ts for how this is served and mutated at runtime.

import type {
  Capture,
  CookingMemory,
  GroceryFind,
  Household,
  HouseholdMember,
  MealCard,
  Profile,
  Recipe,
  ShoppingItem,
  ShoppingList,
  WeeklyPlan,
} from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;
const today = () => new Date();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const isoDateTime = (d: Date) => d.toISOString();
const daysAgo = (n: number) => isoDate(new Date(today().getTime() - n * DAY));
const daysFromNow = (n: number) => isoDate(new Date(today().getTime() + n * DAY));

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export const DEMO_HOUSEHOLD_ID = "h-our-table";
export const MINA_ID = "p-mina";
export const JAE_ID = "p-jae";

export const demoProfiles: Profile[] = [
  { id: MINA_ID, displayName: "Mina", avatarUrl: null, telegramUserId: null, dietaryPreferences: ["More vegetables"], allergies: ["Shellfish"], favouriteCuisines: ["Japanese", "Mexican"], createdAt: daysAgo(400) },
  { id: JAE_ID, displayName: "Jae", avatarUrl: null, telegramUserId: null, dietaryPreferences: ["Weeknight-friendly"], allergies: [], favouriteCuisines: ["Korean", "Italian"], createdAt: daysAgo(400) },
];

export const demoHousehold: Household = {
  id: DEMO_HOUSEHOLD_ID,
  name: "Our Table",
  inviteCode: "table24",
  createdAt: daysAgo(400),
};

export const demoMembers: HouseholdMember[] = [
  {
    id: "hm-mina",
    householdId: DEMO_HOUSEHOLD_ID,
    profileId: MINA_ID,
    role: "owner",
    joinedAt: daysAgo(400),
    profile: demoProfiles[0],
  },
  {
    id: "hm-jae",
    householdId: DEMO_HOUSEHOLD_ID,
    profileId: JAE_ID,
    role: "member",
    joinedAt: daysAgo(400),
    profile: demoProfiles[1],
  },
];

export const RECIPE_KATSU = "r-chicken-katsu-curry";
export const RECIPE_TACOS = "r-weeknight-fish-tacos";
export const RECIPE_SAUCE = "r-grandmas-sunday-sauce";
export const RECIPE_SALMON = "r-miso-glazed-salmon";
export const RECIPE_FRIEDRICE = "r-weekend-tofu-fried-rice";

export const demoRecipes: Recipe[] = [
  {
    id: RECIPE_KATSU,
    householdId: DEMO_HOUSEHOLD_ID,
    title: "Chicken Katsu Curry",
    sourceUrl: "https://example.com/recipe/chicken-katsu-curry",
    description:
      "Crispy panko chicken cutlet swimming in a glossy, mildly sweet curry sauce. Captured from the group chat after Jae found it at 11pm.",
    servings: "4 servings",
    sourceImageUrl: null,
    ingredients: [
      "2 boneless chicken thighs",
      "1 cup panko breadcrumbs",
      "2 tbsp curry roux cubes",
      "1 onion, sliced",
      "1 carrot, sliced",
      "2 cups steamed rice",
      "1 egg, beaten",
      "Neutral oil for frying",
    ],
    instructions:
      "1. Pound chicken thighs to even thickness, season with salt and pepper.\n2. Dredge in flour, egg, then panko.\n3. Shallow-fry until golden, about 3 minutes per side.\n4. Simmer onion and carrot until soft, dissolve curry roux into the broth.\n5. Slice chicken, serve over rice with curry sauce.",
    cuisineTags: ["japanese"],
    ingredientTags: ["chicken", "panko", "curry"],
    illustrationSeed: "chicken-katsu-curry",
    status: "idea",
    discoveredDate: daysAgo(6),
    discoveredBy: JAE_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: RECIPE_TACOS,
    householdId: DEMO_HOUSEHOLD_ID,
    title: "Weeknight Fish Tacos",
    sourceUrl: "https://example.com/recipe/weeknight-fish-tacos",
    description:
      "Quick pan-seared white fish, lime-dressed cabbage slaw, warm corn tortillas. A 25-minute regular.",
    servings: "4 servings",
    sourceImageUrl: null,
    ingredients: [
      "1 lb white fish fillets",
      "8 corn tortillas",
      "2 cups shredded cabbage",
      "1 lime",
      "1/4 cup sour cream",
      "Chili powder",
      "Cilantro",
    ],
    instructions:
      "1. Season fish with chili powder, salt, cumin.\n2. Sear 3 minutes per side until flaky.\n3. Toss cabbage with lime juice and a pinch of salt.\n4. Warm tortillas, assemble with fish, slaw, and a drizzle of crema.",
    cuisineTags: ["mexican"],
    ingredientTags: ["fish", "cabbage", "lime"],
    illustrationSeed: "weeknight-fish-tacos",
    status: "planned",
    discoveredDate: daysAgo(20),
    discoveredBy: MINA_ID,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: RECIPE_SAUCE,
    householdId: DEMO_HOUSEHOLD_ID,
    title: "Grandma's Sunday Sauce",
    sourceUrl: null,
    description:
      "The slow tomato-pork sauce that started this whole household archive. No shortcuts allowed.",
    servings: "6 servings",
    sourceImageUrl: null,
    ingredients: [
      "2 lb pork shoulder",
      "28 oz crushed tomatoes",
      "1 onion, diced",
      "4 cloves garlic",
      "Handful fresh basil",
      "1 lb pasta",
      "Parmesan to finish",
    ],
    instructions:
      "1. Brown pork shoulder on all sides, remove.\n2. Soften onion and garlic in the same pot.\n3. Return pork, add crushed tomatoes, simmer covered 3 hours.\n4. Shred pork back into the sauce, stir in torn basil.\n5. Serve over pasta with parmesan.",
    cuisineTags: ["italian"],
    ingredientTags: ["tomato", "pork", "basil"],
    illustrationSeed: "grandmas-sunday-sauce",
    status: "repeated",
    discoveredDate: daysAgo(90),
    discoveredBy: MINA_ID,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(9),
  },
  {
    id: RECIPE_SALMON,
    householdId: DEMO_HOUSEHOLD_ID,
    title: "Miso Glazed Salmon",
    sourceUrl: "https://example.com/recipe/miso-glazed-salmon",
    description: "Sticky-sweet miso glaze, five ingredients, done under the broiler in ten minutes.",
    servings: "4 servings",
    sourceImageUrl: null,
    ingredients: [
      "4 salmon fillets",
      "3 tbsp white miso",
      "2 tbsp honey",
      "1 tbsp rice vinegar",
      "2 cups steamed rice",
      "Sesame seeds",
    ],
    instructions:
      "1. Whisk miso, honey, and rice vinegar.\n2. Brush over salmon fillets.\n3. Broil 8-10 minutes until caramelized at the edges.\n4. Serve over rice, scatter with sesame seeds.",
    cuisineTags: ["japanese"],
    ingredientTags: ["salmon", "miso", "rice"],
    illustrationSeed: "miso-glazed-salmon",
    status: "cooked",
    discoveredDate: daysAgo(18),
    discoveredBy: JAE_ID,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(18),
  },
  {
    id: RECIPE_FRIEDRICE,
    householdId: DEMO_HOUSEHOLD_ID,
    title: "Weekend Tofu Fried Rice",
    sourceUrl: "https://example.com/recipe/weekend-tofu-fried-rice",
    description:
      "Day-old rice, crispy tofu cubes, whatever vegetables are about to turn. A clean-out-the-fridge favorite.",
    servings: "4 servings",
    sourceImageUrl: null,
    ingredients: [
      "14 oz firm tofu, cubed",
      "3 cups day-old rice",
      "2 eggs",
      "1 cup frozen peas and carrots",
      "2 tbsp soy sauce",
      "1 tsp sesame oil",
      "Green onion",
    ],
    instructions:
      "1. Press and pan-fry tofu cubes until golden on most sides.\n2. Push tofu aside, scramble eggs in the same pan.\n3. Add rice, breaking up clumps, then peas and carrots.\n4. Stir in soy sauce and sesame oil, toss everything together.\n5. Top with sliced green onion.",
    cuisineTags: ["japanese"],
    ingredientTags: ["tofu", "rice", "egg"],
    illustrationSeed: "weekend-tofu-fried-rice",
    status: "idea",
    discoveredDate: daysAgo(3),
    discoveredBy: JAE_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

export const demoGroceryFinds: GroceryFind[] = [
  {
    id: "g-chicken-thighs",
    householdId: DEMO_HOUSEHOLD_ID,
    store: "Safeway",
    ingredient: "Boneless chicken thighs",
    price: 4.99,
    description: "Family pack marked down $2 this week — enough for katsu curry twice.",
    sourceUrl: null,
    imageUrl: null,
    expiryDate: daysFromNow(4),
    createdBy: MINA_ID,
    createdAt: daysAgo(2),
    relatedRecipeIds: [RECIPE_KATSU],
  },
  {
    id: "g-silken-tofu",
    householdId: DEMO_HOUSEHOLD_ID,
    store: "99 Ranch",
    ingredient: "Silken tofu, 3-pack",
    price: 2.49,
    description: "Stock-up size, keeps for weeks unopened. Great for the fried rice.",
    sourceUrl: null,
    imageUrl: null,
    expiryDate: daysFromNow(25),
    createdBy: JAE_ID,
    createdAt: daysAgo(3),
    relatedRecipeIds: [RECIPE_FRIEDRICE],
  },
  {
    id: "g-corn-tortillas",
    householdId: DEMO_HOUSEHOLD_ID,
    store: "Target",
    ingredient: "Corn tortillas, 30-count",
    price: 2.79,
    description: "Good Gather brand, sturdy enough for pan-searing leftovers into quesadillas too.",
    sourceUrl: null,
    imageUrl: null,
    expiryDate: daysFromNow(10),
    createdBy: MINA_ID,
    createdAt: daysAgo(5),
    relatedRecipeIds: [RECIPE_TACOS],
  },
  {
    id: "g-salmon-fillets",
    householdId: DEMO_HOUSEHOLD_ID,
    store: "Trader Joe's",
    ingredient: "Wild-caught salmon fillets",
    price: 8.99,
    description: "Previously frozen but flash-thawed today, needs to be cooked within 2 days.",
    sourceUrl: null,
    imageUrl: null,
    expiryDate: daysFromNow(2),
    createdBy: JAE_ID,
    createdAt: daysAgo(1),
    relatedRecipeIds: [RECIPE_SALMON],
  },
];

const weekStart = startOfWeek(today());
export const DEMO_PLAN_ID = "wp-current";

export const demoWeeklyPlan: WeeklyPlan = {
  id: DEMO_PLAN_ID,
  householdId: DEMO_HOUSEHOLD_ID,
  chapterTitle: "The Week We Tried Something New",
  weeklyMemory: "Fish tacos made Monday feel easy. We changed our minds twice, ate out once, and still ended the week around our own table.",
  weekStartDate: isoDate(weekStart),
  createdAt: isoDateTime(weekStart),
};

export const MEAL_MON = "mc-mon";
export const MEAL_TUE = "mc-tue";
export const MEAL_THU = "mc-thu";
export const MEAL_SAT = "mc-sat";

export const demoMealCards: MealCard[] = [
  { id: MEAL_MON, weeklyPlanId: DEMO_PLAN_ID, dayIndex: 0, recipeId: RECIPE_TACOS, state: "cooked", note: null, createdAt: isoDateTime(weekStart) },
  { id: MEAL_TUE, weeklyPlanId: DEMO_PLAN_ID, dayIndex: 1, recipeId: RECIPE_SAUCE, state: "planned", note: null, createdAt: isoDateTime(weekStart) },
  { id: "mc-wed", weeklyPlanId: DEMO_PLAN_ID, dayIndex: 2, recipeId: null, state: "eating_out", note: "Date night at Luna's", createdAt: isoDateTime(weekStart) },
  { id: MEAL_THU, weeklyPlanId: DEMO_PLAN_ID, dayIndex: 3, recipeId: RECIPE_FRIEDRICE, state: "planned", note: null, createdAt: isoDateTime(weekStart) },
  { id: "mc-fri", weeklyPlanId: DEMO_PLAN_ID, dayIndex: 4, recipeId: RECIPE_SALMON, state: "replaced", note: "Swapped for leftovers, too tired to cook", createdAt: isoDateTime(weekStart) },
  { id: MEAL_SAT, weeklyPlanId: DEMO_PLAN_ID, dayIndex: 5, recipeId: RECIPE_KATSU, state: "planned", note: null, createdAt: isoDateTime(weekStart) },
  { id: "mc-sun", weeklyPlanId: DEMO_PLAN_ID, dayIndex: 6, recipeId: null, state: "skipped", note: "Potluck at the Kims' — bringing dessert instead", createdAt: isoDateTime(weekStart) },
];

export const demoShoppingList: ShoppingList = {
  id: "sl-current",
  weeklyPlanId: DEMO_PLAN_ID,
  generatedAt: isoDateTime(weekStart),
};

export const demoShoppingItems: ShoppingItem[] = [
  { id: "si-1", shoppingListId: "sl-current", name: "Pork shoulder", quantity: "2 lb", category: "Meat", store: "Safeway", haveIt: false, checked: false, substitution: null, sourceMealCardIds: [MEAL_TUE], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-2", shoppingListId: "sl-current", name: "Crushed tomatoes", quantity: "28 oz can", category: "Pantry", store: "Safeway", haveIt: true, checked: false, substitution: null, sourceMealCardIds: [MEAL_TUE], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-3", shoppingListId: "sl-current", name: "Fresh basil", quantity: "1 bunch", category: "Produce", store: "Trader Joe's", haveIt: false, checked: false, substitution: "Dried basil works in a pinch", sourceMealCardIds: [MEAL_TUE], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-4", shoppingListId: "sl-current", name: "Firm tofu", quantity: "14 oz", category: "Refrigerated", store: "99 Ranch", haveIt: true, checked: true, substitution: null, sourceMealCardIds: [MEAL_THU], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-5", shoppingListId: "sl-current", name: "Frozen peas and carrots", quantity: "10 oz bag", category: "Frozen", store: "Target", haveIt: false, checked: false, substitution: null, sourceMealCardIds: [MEAL_THU], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-6", shoppingListId: "sl-current", name: "Chicken thighs", quantity: "2 lb", category: "Meat", store: "Safeway", haveIt: false, checked: true, substitution: null, sourceMealCardIds: [MEAL_SAT], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-7", shoppingListId: "sl-current", name: "Panko breadcrumbs", quantity: "1 cup", category: "Pantry", store: "99 Ranch", haveIt: true, checked: false, substitution: null, sourceMealCardIds: [MEAL_SAT], isManual: false, createdAt: isoDateTime(weekStart) },
  { id: "si-8", shoppingListId: "sl-current", name: "Curry roux cubes", quantity: "1 box", category: "Pantry", store: "99 Ranch", haveIt: false, checked: false, substitution: null, sourceMealCardIds: [MEAL_SAT], isManual: false, createdAt: isoDateTime(weekStart) },
];

export const demoCookingMemories: CookingMemory[] = [
  {
    id: "cm-1",
    householdId: DEMO_HOUSEHOLD_ID,
    recipeId: RECIPE_SAUCE,
    mealCardId: null,
    dateCooked: daysAgo(52),
    membersPresent: [MINA_ID, JAE_ID],
    photoUrl: null,
    note: "Let it simmer all afternoon while we half-watched a movie. The whole apartment smelled like Sunday. Jae had thirds.",
    rating: 5,
    wouldMakeAgain: "yes",
    changesMade: "Added extra basil from the balcony plant",
    occasion: "Sunday family dinner",
    createdAt: daysAgo(52),
  },
  {
    id: "cm-2",
    householdId: DEMO_HOUSEHOLD_ID,
    recipeId: RECIPE_SALMON,
    mealCardId: null,
    dateCooked: daysAgo(18),
    membersPresent: [JAE_ID],
    photoUrl: null,
    note: "Broiler ran a little hot and the edges went almost-too-dark, but that's honestly the best part. Ten minutes start to finish on a Tuesday.",
    rating: 4,
    wouldMakeAgain: "yes",
    changesMade: "Used the broiler instead of a pan",
    occasion: "Weeknight dinner, just Jae home",
    createdAt: daysAgo(18),
  },
  {
    id: "cm-3",
    householdId: DEMO_HOUSEHOLD_ID,
    recipeId: RECIPE_SAUCE,
    mealCardId: null,
    dateCooked: daysAgo(9),
    membersPresent: [MINA_ID, JAE_ID],
    photoUrl: null,
    note: 'Made it again for Mina\'s birthday because she asked for "the sauce, obviously." Doubled the batch and froze half.',
    rating: 5,
    wouldMakeAgain: "yes",
    changesMade: "Doubled the recipe, froze half for later",
    occasion: "Mina's birthday",
    createdAt: daysAgo(9),
  },
];

export const demoCaptures: Capture[] = [
  {
    id: "cap-1",
    householdId: DEMO_HOUSEHOLD_ID,
    telegramChatId: -1001234567890,
    telegramMessageId: 4821,
    senderName: "Jae",
    rawText:
      "#chicken #japanese\n\nWant to try this chicken katsu curry next week.\nhttps://example.com/recipe/chicken-katsu-curry",
    urls: ["https://example.com/recipe/chicken-katsu-curry"],
    imageUrls: [],
    hashtags: ["chicken", "japanese"],
    messageLink: "https://t.me/c/1234567890/4821",
    status: "linked",
    linkedRecipeId: RECIPE_KATSU,
    linkedGroceryFindId: null,
    createdAt: daysAgo(6),
  },
];

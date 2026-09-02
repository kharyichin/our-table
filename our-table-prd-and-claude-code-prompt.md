# Our Table — PRD, Technical Specification, and Claude Code Prompt

## 1. Product overview

**Working name:** Our Table

**Product promise:** Turn the meals we discover and cook into a story we can keep.

Our Table is a shared, illustrated household food archive. It helps couples and families capture recipe ideas and grocery finds through a Telegram group, plan meals around the week’s ingredients and deals, generate a shopping list, record cooking memories, and look back on how their food life changes over months and years.

The product is not primarily a nutrition tracker or generic recipe database. Its emotional purpose is preserving a family’s food story.

## 2. Users and core use case

The initial household consists of the user and her husband. Future households may include children, parents, relatives, or friends.

The recurring loop is:

```text
Discover a dish or grocery find
        ↓
Capture it in Telegram
        ↓
Plan the week
        ↓
Shop and cook
        ↓
Record the memory
        ↓
Look back over time
```

## 3. Product principles

1. Telegram is the natural capture layer.
2. Hashtags describe ingredients and cuisines, not workflow statuses.
3. Recipes and memories are separate objects.
4. Grocery deals inspire the week but are temporary.
5. The household—not the individual—is the main unit.
6. Planning should feel useful; the archive should feel emotionally valuable.
7. The design should feel like an original tactile food storybook, not a productivity dashboard.

## 4. MVP scope

### 4.1 Household

Users can create a household and invite members. Members can view and edit shared content.

Each member has:

- Name
- Avatar or illustrated character
- Optional dietary preferences
- Optional allergies
- Optional favourite cuisines
- Telegram user ID, when connected

### 4.2 Telegram capture

Connect one Telegram group to one household. The bot reads messages containing recipe names, URLs, photos, grocery finds, and ingredient or cuisine hashtags.

Example:

```text
#chicken #japanese

Want to try this chicken katsu curry next week.
https://example.com/recipe
```

The system extracts the message, sender, date, URLs, images, hashtags, and probable recipe or grocery information. It creates a draft item for review when confidence is low.

Do not require hashtags such as `#try` or `#tried`.

### 4.3 Idea Garden

The Idea Garden contains saved recipes and dishes discovered through Telegram or added manually.

Recipe fields:

- Title
- Source URL and source name
- Description
- Ingredients
- Instructions
- Cuisine tags
- Ingredient tags
- Illustration or image
- Date discovered
- Discovered by
- Status: Idea, Planned, Cooked, Repeated, Archived

Users can search, filter, edit, archive, favourite, and add recipes to the weekly plan.

### 4.4 Grocery Finds

Grocery finds can be sent to Telegram or entered manually.

Example:

```text
#99ranch

Pork belly is on sale this week.
```

Fields:

- Store
- Ingredient
- Price, if known
- Deal description
- Image or screenshot
- URL
- Date captured
- Expiry date
- Related recipes

Initial stores: Safeway, 99 Ranch, Target, and Trader Joe’s.

Deals expire from the active planning view but remain in the household history if they led to a meal or memory.

### 4.5 Weekly Story

The Weekly Story is the main recurring experience. It contains:

- Editable chapter title
- Seven-day meal calendar
- Grocery finds
- Planned meals
- Shopping list
- Actual outcomes: Cooked, Skipped, Replaced, or Eating out
- Optional weekly memory

Example title: **Chapter 4: Our First Autumn in California**.

### 4.6 Shopping list

Generate a shopping list from planned recipes.

Support:

- Duplicate ingredient merging
- Store grouping
- Category grouping
- Already-have state
- Checked state
- Substitution field
- Source meal references
- Manual additions

### 4.7 Cooking Memory

A Cooking Memory is attached to a cooking event, not merely to a recipe. One recipe can have multiple memories.

Fields:

- Recipe and planned meal
- Date cooked
- Household members present
- Photo
- Free-text note
- Rating
- Would make again: Yes, No, Maybe
- Changes made
- Occasion or context

Example:

> We made this after visiting 99 Ranch for the first time. The sauce was too salty, but the crispy eggplant was great. Use less soy sauce next time.

### 4.8 Memory Book

The Memory Book displays the household’s food history as a visual timeline.

Views:

- Timeline
- Month
- Season
- Year
- Cuisine
- Ingredient
- Household member

Show meals cooked, photos, illustrations, memories, new cuisines, new ingredients, and repeated favourites.

## 5. Design direction

Create an original tactile food-storybook design system using:

- Hand-cut paper collage forms
- Visible paper grain
- Watercolour, crayon, or pencil textures
- Warm cream backgrounds
- Bright food colours
- Organic imperfect edges
- Playful typography
- Illustrated dishes and ingredients
- Layered paper-like cards

The attached references communicate the desired warmth, collage, food illustration, and storybook feeling. Do not copy Eric Carle’s exact artwork, characters, typography, or compositions. Use only broad qualities such as tactile collage, bold colour, handmade texture, and childlike discovery.

Illustration generation must be optional. Use placeholders or a small local illustration library initially so the product remains functional without an image-generation service.

## 6. MVP screens

1. **Home / This Week** — current chapter, planned meals, grocery finds, and pending captures.
2. **Idea Garden** — saved recipes and ingredient/cuisine exploration.
3. **Recipe detail** — recipe information, illustration, status, and cooking memories.
4. **Weekly Story** — calendar, grocery finds, and shopping list.
5. **Shopping** — mobile-friendly checklist grouped by store and category.
6. **Memory Book** — chronological household history.
7. **Household settings** — members, Telegram connection, and preferences.

## 7. Technical specification

### Recommended stack

- Next.js with TypeScript
- Tailwind CSS
- Supabase for database, authentication, and storage
- Telegram Bot API
- Vercel-compatible deployment
- Responsive PWA for desktop, tablet, and mobile

### Core entities

#### Household

```text
id
name
cover_image
current_chapter_title
created_at
```

#### HouseholdMember

```text
id
household_id
name
avatar_url
telegram_user_id
preferences
created_at
```

#### TelegramConnection

```text
id
household_id
telegram_chat_id
chat_title
connected_at
last_synced_at
```

#### Capture

Stores the raw Telegram message before it is structured.

```text
id
household_id
telegram_message_id
sender_id
text
image_url
source_url
hashtags
captured_at
processing_status
```

#### Recipe

```text
id
household_id
title
source_url
source_name
description
ingredients
instructions
image_url
illustration_url
cuisine_tags
ingredient_tags
status
discovered_at
discovered_by
created_at
```

#### GroceryFind

```text
id
household_id
store
item_name
price
description
image_url
source_url
captured_at
expires_at
related_recipe_ids
```

#### WeeklyPlan

```text
id
household_id
week_start
title
summary
created_at
```

#### PlannedMeal

```text
id
weekly_plan_id
recipe_id
date
meal_type
status
notes
```

#### ShoppingItem

```text
id
weekly_plan_id
name
quantity
unit
store
category
source_recipe_ids
is_already_owned
is_checked
substitution
```

#### CookingMemory

```text
id
household_id
recipe_id
planned_meal_id
created_by
cooked_at
photo_url
note
rating
would_make_again
changes_made
occasion
created_at
```

### Telegram behaviour

Implement a webhook endpoint. On each group message:

1. Save the raw message as a Capture.
2. Store sender and timestamp.
3. Extract URLs, images, and hashtags.
4. Detect likely recipe or grocery content.
5. Create a draft Recipe or GroceryFind.
6. Preserve the Telegram message reference where possible.
7. Reply with a short confirmation.

Make webhook processing idempotent using the Telegram chat ID and message ID. Duplicate webhook events must not create duplicate records.

Commands:

```text
/help
/thisweek
/ideas
/shopping
/memories
```

Telegram is for capture and lightweight interaction. The web app is for planning, shopping, and browsing memories.

### Authentication flow

1. User signs in with email magic link or Telegram login.
2. User creates a household.
3. User connects a Telegram group.
4. User invites household members through a link.
5. Members join and access shared content.

### MVP acceptance criteria

- A Telegram message becomes a visible recipe idea.
- Ingredient and cuisine hashtags are searchable.
- A grocery find can be linked to a recipe or weekly plan.
- A recipe can be added to a day in the weekly calendar.
- A shopping list is generated from planned meals.
- Two household members can edit shared content.
- A cooked meal can receive a photo and memory.
- A recipe can have multiple cooking memories.
- The household can browse a timeline of past meals.
- The app is usable on desktop, tablet, and mobile.
- The core app works if recipe parsing or illustration generation is unavailable.

## 8. Explicitly out of scope for MVP

- Automatic scraping of every grocery website
- Direct grocery ordering
- Detailed calorie or macro tracking
- Public social feeds
- Complex pantry inventory
- Barcode scanning
- Native iOS and Android apps
- Fully automatic AI meal plans
- Large public recipe database

## 9. Claude Code build prompt

```text
You are a senior full-stack product engineer and product designer.

Build the MVP described in this file: Our Table, a shared illustrated household food archive.

First inspect the repository and identify the current framework, database setup, and conventions. Do not replace an existing stack without explaining why.

The core user journey is:

Telegram recipe or grocery message → recipe/grocery capture → Idea Garden → Weekly Story → shopping list → cooking memory → Memory Book timeline.

Use the existing stack if practical. Otherwise use:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase for database, authentication, and storage
- Telegram Bot API
- Responsive PWA design

Create these routes:

- /home
- /ideas
- /recipes/[id]
- /week
- /shopping
- /memories
- /household/settings

Implement the following features:

1. Household creation and member invitations.
2. Shared household members and avatars.
3. Recipe Idea Garden with search, ingredient tags, cuisine tags, status, source URL, image, and illustration placeholder.
4. Grocery Finds with store, ingredient, price, description, image, URL, expiry date, and related recipes.
5. Weekly Story with editable chapter title and seven-day meal calendar.
6. Planned meal states: Planned, Cooked, Skipped, Replaced, Eating out.
7. Shopping list generated from weekly recipes, with duplicate merging, store grouping, category grouping, already-have state, substitutions, and check-off state.
8. Cooking Memories attached to cooking events, including date, members present, photo, note, rating, would-make-again, changes, and occasion.
9. Memory Book timeline grouped by month, with meals, photos, recipe illustrations, memories, new cuisines, new ingredients, and repeated favourites.
10. Telegram webhook integration.

Telegram rules:

- Ingredient and cuisine hashtags are the main tagging system.
- Do not require #try or #tried.
- Store raw messages as Captures.
- Extract URLs, images, hashtags, sender, and timestamp.
- Create a draft Recipe or GroceryFind.
- Create an Inbox/review state when extraction is uncertain.
- Make webhook handling idempotent using Telegram chat ID and message ID.
- Add /help, /thisweek, /ideas, /shopping, and /memories commands.

Example Telegram input:

#chicken #japanese
Want to try this chicken katsu curry next week.
https://example.com/recipe

Expected output:

- Recipe title: Chicken Katsu Curry
- Ingredient tag: chicken
- Cuisine tag: japanese
- Source URL saved
- Sender and date saved
- Status: Idea

Important product decisions:

- Hashtags describe ingredients and cuisines, not workflow statuses.
- Recipes and Cooking Memories are separate entities.
- Commentary belongs to the Cooking Memory.
- Grocery deals are temporary planning inputs.
- Recipes and memories are permanent household history.
- Telegram is the capture layer, not the main planning interface.

Design requirements:

- Create an original tactile food-storybook interface.
- Use warm cream backgrounds, bold food colours, paper textures, organic shapes, playful typography, and illustrated dishes.
- The attached visual references are inspiration for handmade collage and food-storybook qualities only. Do not copy Eric Carle’s exact style, artwork, characters, typography, or compositions.
- Avoid generic SaaS dashboards, glassmorphism, excessive gradients, and cold productivity-app styling.
- Make the Memory Book the most emotionally distinctive screen.
- Make the Weekly Story practical and easy to use.
- Make shopping mode highly legible on a phone.
- Use realistic household and recipe demo data.

Engineering requirements:

- Use strong TypeScript types.
- Create database migrations and seed data.
- Add loading, empty, error, and review states.
- Keep components modular.
- Do not add unnecessary dependencies.
- Keep illustration generation optional or mocked.
- Keep the app functional without external AI services.
- Add clear environment-variable documentation.

Before finishing:

1. Run the application locally.
2. Run type checks and linting.
3. Test Telegram capture or provide a local mock webhook.
4. Test the complete journey from capture to Memory Book.
5. Report what works, what is mocked, and what requires credentials.
6. Provide exact setup and run commands.
```

# Our Table — Project Instructions

## Product

Our Table is a shared, illustrated household food archive for couples and families.

Its core promise is:

> Turn the meals we discover and cook into a story we can keep.

The product helps a household:

1. Capture recipe ideas and grocery finds through a shared Telegram group.
2. Organise recipes by ingredient and cuisine hashtags.
3. Plan meals around weekly grocery finds.
4. Generate a practical shopping list.
5. Record cooking memories.
6. Look back at the household’s food life over months and years.

## Important product decisions

- The household is the main unit, not the individual.
- Telegram is the natural capture layer.
- Ingredient and cuisine hashtags are the main tags.
- Do not require hashtags such as #try or #tried.
- Examples: #chicken, #japanese, #tofu, #99ranch.
- Recipe workflow statuses are app fields:
  - Idea
  - Planned
  - Cooked
  - Repeated
  - Archived
- Commentary belongs in Cooking Memories attached to a specific cooking event.
- One recipe can have multiple Cooking Memories.
- Grocery deals are temporary weekly planning inputs.
- Recipes and memories are permanent household history.
- Telegram is for quick capture; the web app is for planning, shopping, and browsing memories.

## Product experience

The main loop is:

Discover a dish or grocery find → capture it in Telegram → plan the week → shop and cook → record the memory → look back over time.

Core areas:

- Idea Garden
- Grocery Finds
- Weekly Story
- Shopping List
- Recipe Detail
- Cooking Memories
- Memory Book
- Household Members

## Design direction

The interface should feel like an original tactile food storybook:

- Warm cream backgrounds
- Hand-cut paper collage forms
- Visible paper grain
- Watercolour, crayon, or pencil-like food illustrations
- Bright food colours
- Organic imperfect shapes
- Playful typography
- Illustrated dishes and ingredients
- Layered paper-like cards
- Warm, personal writing

Do not make it look like a generic SaaS dashboard, nutrition tracker, or productivity app.

The product may be inspired by the broad qualities of tactile children’s picture books, but must not copy Eric Carle’s exact artwork, characters, typography, compositions, or visual style.

## Technical direction

Prefer the project’s existing stack. If no stack has been established, use:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Telegram Bot API
- Responsive PWA
- Vercel-compatible deployment

The app must work well on:

- Desktop for weekly planning and browsing
- Tablet for planning and cooking
- Mobile for shopping, cooking, and quick memory capture

## Engineering behaviour

Before changing code:

1. Inspect the existing application.
2. Understand the current routes, components, data model, and styling.
3. Run the application locally.
4. Compare the current experience against this product direction.
5. Explain the proposed changes briefly.

When making changes:

- Preserve working functionality.
- Use modular components.
- Use strong TypeScript types.
- Add loading, empty, and error states.
- Avoid unnecessary dependencies.
- Keep illustration generation optional.
- Use realistic demo data.
- Do not build out-of-scope features unless requested.
- After changes, run the app, type checks, linting, and relevant tests.

## Definition of done

The main MVP flow should work:

Telegram capture or mock capture → Recipe Idea → Weekly Plan → Grocery List → Cooking Memory → Memory Book.
# Our Table

A shared, illustrated household food archive. Capture recipe ideas and grocery finds from a Telegram group, plan the week as a storybook spread, generate a shopping list, and keep the cooking memories that turn meals into a family's food story.

> "Turn the meals we discover and cook into a story we can keep."

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Auth + Storage) — optional; see **Demo mode** below
- Telegram Bot API (webhook-based capture + light commands)
- Installable PWA (manifest + offline app-shell service worker)

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No environment variables are required** — without `NEXT_PUBLIC_SUPABASE_URL` set, the app runs entirely against an in-memory demo dataset (`src/lib/demo-data.ts`) seeded with a sample household, five recipes, four grocery finds, a weekly plan, and three cooking memories. Every feature — creating recipes, planning the week, checking off shopping items, logging memories, even the Telegram webhook — works in this mode. State resets when the dev server restarts.

## Connecting real Supabase + Telegram

1. Create a Supabase project, then run the migrations in `supabase/migrations/` in order (via the SQL editor or `supabase db push`).
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your project's API settings.
3. Sign in through the app and create a household, or accept an invitation to an existing household.
4. Create a Telegram bot via [@BotFather](https://t.me/BotFather), set `TELEGRAM_BOT_TOKEN`, and register the webhook:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
   ```
5. As the household owner, open Household Settings, generate a one-time linking command, and send it inside the Telegram group. The code expires after 15 minutes.
6. Set `NEXT_PUBLIC_APP_URL` to your deployed URL so bot replies link back correctly.

## Project structure

```
src/app/                   routes: /home /ideas /recipes/[id] /week /finds /shopping /memories /household/settings /account
src/app/api/telegram/webhook/route.ts   Telegram webhook (idempotent capture → draft recipe/grocery find)
src/app/*/actions.ts       Server Actions used by client forms (create/update/delete)
src/lib/data/              data-access layer — Supabase when configured, in-memory store otherwise
src/lib/telegram/          hashtag/URL parsing, capture classification, bot commands, sendMessage client
src/lib/memoryBook.ts      deterministic monthly-summary calculation for the Memory Book
src/components/illustrations/  small original paper-cut-style SVG illustration system
supabase/migrations/       schema, RLS policies, storage bucket
supabase/seed.sql          matches src/lib/demo-data.ts
```

## Design system

Warm cream backgrounds, hand-cut paper-collage cards (layered shadows, slight rotation, subtle grain), a playful display font (Fredoka) over a rounded body font (Nunito), and a small deterministic illustration system (`src/components/illustrations/FoodIllustration.tsx`) that picks from a handful of paper-cut dish/ingredient glyphs by hashing each recipe's id — no AI image generation required, and the product stays fully usable if that's never wired up.

## Known gaps / manual setup

- **Cooking memory photos** upload to a Supabase Storage bucket (`memory-photos`, created by `supabase/migrations/0003_storage.sql`) when Supabase is configured; in demo mode they're kept as in-memory data URLs so the feature is still testable end to end.
- **Telegram capture photos** are copied into the private `telegram-media` bucket and served through an authenticated, household-scoped app route; Telegram's temporary token-bearing URLs are never persisted.
- **Telegram testing on localhost** requires a secure public tunnel because Telegram must be able to reach `/api/telegram/webhook`. Production should use the deployed HTTPS URL.
- The Telegram classifier (`src/lib/telegram/parse.ts`) is a deterministic heuristic (hashtags, URLs, store names, price patterns), not ML — genuinely ambiguous messages correctly fall back to the in-app inbox on `/ideas` rather than guessing.

## Commands

```bash
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
npx tsc --noEmit # type-check
```

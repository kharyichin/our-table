# Our Table — Revised Product Requirements

**Status:** Proposed working PRD  
**Revised:** 2026-08-31  
**Original preserved:** `our-table-prd-and-claude-code-prompt.md`

## 1. Revision summary

The product promise and household food-story loop remain correct. This revision narrows the MVP around a trustworthy shared household, records decisions made during implementation, and separates launch requirements from later visual experiments.

Changes from the original:

1. **Authentication and household isolation are the primary dependency.** The demo proves the feature loop, but production cannot infer an implicit household.
2. **Home and Weekly Story are distinct.** Home orients the household around the current chapter; Weekly Story is the operational planning surface.
3. **Grocery Finds and Shopping are distinct concepts.** Finds inspire planning; Shopping is the focused checklist.
4. **Calendar browsing belongs to Weekly Story.** Week navigation, story/calendar switching, selected-week highlighting, and date-to-week navigation are MVP behavior.
5. **Member preferences live on profiles.** Dietary preferences, allergies, and favourite cuisines are editable. Allergy warnings are future behavior until matching rules are specified.
6. **Emoji are not interface elements.** Use original line icons, text, photos, and illustrations.
7. **Literal cookbook motion is deferred.** Tactile warmth remains important, but page-turn animation is not a launch dependency.
8. **Artwork licensing is explicit.** The international-food watercolor pack is preferred for future recipe/menu imagery. Individual assets must be prepared and attribution added when required.
9. **The app remains useful without AI, scraping, or generated illustration.** Deterministic parsing and local fallbacks remain supported.

## 2. Product definition

Our Table is a shared household food archive for couples and families.

> Turn the meals we discover and cook into a story we can keep.

```text
Discover or find something
        ↓
Capture it in Telegram or the app
        ↓
Review and organise the idea
        ↓
Plan the household week
        ↓
Generate and use the shopping list
        ↓
Record what was actually cooked
        ↓
Return to the memory over time
```

Accounts provide identity and access. The household owns recipes, plans, grocery finds, shopping lists, and memories.

## 3. Problem statement

Household food discoveries are scattered across chat messages, saved links, grocery photos, notes, and memory. Planning tools may help decide what to cook but rarely preserve why a meal mattered or how it changed over repeated cooking events.

Our Table should make capture nearly effortless, turn discoveries into a practical weekly plan, and preserve cooking events as shared household history without becoming a generic productivity or nutrition application.

## 4. MVP goals

1. A new household reaches its first planned meal within ten minutes of signing in.
2. Two authenticated members can safely view and edit the same household content.
3. A capture can travel through planning, shopping, cooking, and memory without database administration.
4. Planning is practical on desktop/tablet and shopping is efficient on mobile.
5. Repeated cooking events accumulate meaningful recipe history.
6. External-service failure never blocks the core loop.

## 5. Non-goals

- Automatic scraping of every recipe or grocery website.
- Mandatory AI classification or AI meal planning.
- Grocery ordering or delivery integration.
- Nutrition, calorie, or macro tracking.
- Complex pantry inventory and barcode scanning.
- Public profiles, public recipes, or social feeds.
- Native mobile applications.
- Literal page-turn animation as a launch requirement.
- Automated printed cookbooks or advanced yearly storytelling.

## 6. Users and access

### Household owner

- Creates the household.
- Invites and removes members.
- Connects or disconnects Telegram.
- Edits shared household content.

### Household member

- Joins through an invitation.
- Captures, plans, shops, and records memories.
- Edits their profile and food preferences.

### Access rules

- Unauthenticated visitors can access only authentication and invitation-entry pages.
- Signed-in people can access only households where they have membership.
- Every household query and mutation resolves and verifies the active household.
- Service-role access is limited to trusted webhook/server operations.

## 7. Requirements

### P0 — must ship

#### Authentication and onboarding

- Email magic-link sign-in and sign-out.
- First-run create-household or accept-invitation path.
- Idempotent authenticated invitation acceptance.
- Active-household resolution replaces implicit demo-household selection.
- Account page includes profile, preferences, account controls, and credits.
- Clear loading, expired-link, unauthorized, and recoverable error states.

#### Capture and review

- Telegram stores message identity, sender, text, URLs, photos, hashtags, and timestamp.
- Duplicate webhook delivery never creates duplicate domain objects.
- Mock capture exercises the same classification behavior.
- Low-confidence captures enter a review inbox.
- Ingredient and cuisine hashtags remain the primary taxonomy.

#### Idea Garden and recipe detail

- Search/filter by title, status, ingredient, and cuisine.
- Create, edit, archive, favourite, and plan recipes.
- Recipe statuses remain Idea, Planned, Cooked, Repeated, and Archived.
- One recipe accumulates multiple Cooking Memories.
- Image/illustration failure never blocks recipe use.

#### Weekly Story

- Editable chapter title and weekly memory.
- Seven dated days with planned, cooked, skipped, replaced, and eating-out outcomes.
- Previous/next week navigation.
- Story/month calendar views with selected-week highlighting.
- Calendar dates open their corresponding week.
- Planning and cooking synchronize recipe status.

#### Grocery Finds and Shopping

- Finds include store, ingredient, price, description, URL/image, capture date, expiry, and related recipes.
- Active planning hides irrelevant expired finds but preserves finds linked to meals or memories.
- Shopping lists generate from the selected week.
- Parsing and merging preserve meaningful quantities and source meals.
- Safe regeneration preserves manual items, checked/have states, and substitutions.
- Shopping is one-hand usable on narrow mobile screens.

#### Cooking Memories and archive

- Memories belong to cooking events and recipes, with optional meal-plan references.
- Support date, members, photo, note, rating, changes, occasion, and would-make-again.
- `wouldMakeAgain` is explicitly **yes**, **no**, or **maybe**, not a nullable boolean.
- Memory Book supports timeline/month and cuisine, ingredient, member, season, and year filters.
- Recipe detail displays repeated cooking events.

#### Reliability and safety

- Generated Supabase types are used by the data layer.
- Household RLS and invitations have integration coverage.
- Telegram media is copied into durable household-scoped storage.
- Routes include loading, empty, error, and permission states.
- The full capture-to-archive journey has an end-to-end test.

### P1 — fast follow

- Multiple households and a household switcher.
- Richer recipe-source import.
- More expressive member characters and photo-forward archives.
- Seasonal/yearly generated recaps.
- Guided Telegram-linking validation.
- Account data export and guided deletion.

### P2 — future

- Allergy warnings backed by explicit ingredient-matching rules.
- Existing ingredient glyphs and ingredient artwork as allergy indicators.
- International-food watercolor recipe/menu illustrations.
- Printed or shareable household cookbooks.
- Optional AI-assisted parsing and illustration.

## 8. Information architecture

- **Home:** Today, pending captures, current chapter, recent ideas/finds, latest memory.
- **Idea Garden:** Permanent recipe discovery and organisation.
- **Recipe Detail:** Recipe, planning action, status, related finds, cooking history.
- **Weekly Story:** Dated meal plan, outcomes, grocery inspiration, weekly memory.
- **Calendar:** Month navigation into Weekly Story.
- **Grocery Finds:** Temporary planning inputs and their relationships.
- **Shopping:** Generated/manual checklist.
- **Memory Book:** Permanent household cooking-event archive.
- **Household:** Members, invitations, preferences, Telegram, household controls.
- **Account/Credits:** Identity, account controls, and required artwork attribution.

## 9. Visual direction

The interface should feel like a contemporary illustrated kitchen journal: warm, tactile, personal, colourful, and composed around food stories.

- Warm paper surfaces with restrained grain.
- Straight, readable layouts; texture and artwork provide irregularity, not slanted controls.
- Original icons and illustrations; no emoji decoration.
- Strong editorial hierarchy and efficient desktop composition.
- Photo-led memories when photos exist.
- High-contrast, thumb-friendly shopping interactions.
- Optional, brief, reduced-motion-safe animation.
- Avoid generic SaaS dashboards, glassmorphism, repetitive card grids, and decorative motion that obscures navigation.

Artwork decision:

- Prefer the international-food watercolor pack.
- Prepare individual optimized assets; do not ship the composition sheet directly.
- Confirm the applicable free/premium license before integration.
- When required, credit **rawpixel.com / Freepik** on Account/Credits.

## 10. Technical direction

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Supabase Auth, Postgres, RLS, and Storage.
- Telegram Bot API webhook with secret validation and idempotency.
- Responsive installable PWA.
- Generated database types and a consistent data-access boundary.
- Demo mode remains useful, but production never infers identity from demo data.
- AI and illustration services remain optional.

## 11. Acceptance criteria

- A person signs in, creates a household, and reaches Home without database administration.
- An invited second member joins and sees the same household data.
- A non-member cannot read or mutate another household.
- Telegram/mock messages become reviewable recipe or grocery captures.
- Ingredient and cuisine hashtags are searchable.
- A recipe planned on a date appears in Story and Calendar.
- Expired finds leave active planning without losing meal history.
- Shopping regeneration merges ingredients without deleting manual work or state.
- A cooked meal receives a complete Cooking Memory and optional photo.
- A recipe displays multiple memories from separate cooking events.
- Memory Book filters by time, cuisine, ingredient, and member.
- The core loop works on desktop, tablet, and mobile without AI services.
- Tests cover household isolation, webhook idempotency, shopping regeneration, and the end-to-end loop.

## 12. Delivery sequence

Estimates assume one focused developer familiar with the codebase and exclude external account setup delays.

### Phase A — identity and ownership: 5–9 focused days

1. Correct schema/domain types and generate Supabase definitions.
2. Add authentication and sessions.
3. Resolve active household.
4. Build create/join onboarding.
5. Complete invitations and member management.
6. Add Account/Credits.

### Phase B — operational hardening: 5–8 focused days

1. Standardize mutation feedback and route error states.
2. Separate Grocery Finds and define expiry lifecycle.
3. Harden shopping parsing, merging, and regeneration.
4. Add Telegram linking and durable media.
5. Audit webhook and RLS security.

### Phase C — launch verification: 4–7 focused days

1. Add unit and integration test foundations.
2. Add the core end-to-end journey.
3. Verify responsive PWA and accessibility behavior.
4. Complete release QA.

### Deferred visual phase

Revisit cookbook motion and integrate licensed artwork only after Phases A–C. This prevents visual experiments from repeatedly changing layouts needed by onboarding and core workflows.

## 13. Initial beta success metrics

- 80% of invited members join without administrator help.
- Median sign-in-to-first-planned-meal time is under ten minutes.
- 90% of captures reach recipe/find/review without data loss.
- 80% of planned cooked meals reach memory creation without error.
- Automated RLS tests find no cross-household access.
- The core end-to-end test passes before every release.

## 14. Open questions

### Blocking

- Which Supabase project and callback URLs will development and deployment use? **Product/engineering**
- Is magic-link email the only MVP sign-in method, or should Google OAuth ship too? **Product**
- Can an MVP account belong to multiple households, or is that only future schema support? **Product**
- Was each artwork pack downloaded under a free or premium license? **Product/legal**

### Non-blocking

- What rules should turn a stored allergy into a planning warning? **Product/design**
- Should Grocery Finds be top-level navigation or a Weekly Story subview? **Product/design**
- Which privacy-conscious analytics will measure beta activation? **Product/engineering**

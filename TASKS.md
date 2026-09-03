# Tasks

Effort guide: **S** = 1–3 hours, **M** = 4–8 hours, **L** = 1–3 focused days. Tasks are ordered by dependency, not visual appeal.

## Active

### Next — harden the working household loop


### Then — verification and launch readiness


## Waiting On

- [ ] **Add data-layer integration tests** - household isolation, invitations, shopping regeneration, memory creation, and Telegram idempotency; requires an isolated test Supabase URL, publishable key, and service-role key so fixtures cannot affect development data; **L**
- [ ] **Configure Telegram credentials and public webhook** - add the bot token and a strong webhook secret, deploy or open a secure tunnel, then register and test the Telegram webhook
- [ ] **Generate Supabase TypeScript definitions** - replace loosely typed row mapping after the finalized migrations are applied to the development project; **M**
- [ ] **Confirm international-food artwork license tier** - free use requires visible rawpixel.com / Freepik attribution; premium terms differ

## Someday

- [ ] **Revisit cookbook opening and page-turn interaction** - replace the current experiment only after core flows are stable
- [ ] **Integrate the international-food watercolor pack** - prepare individual optimized assets for recipes and menus after licensing is confirmed
  - Prefer the international-food pack over the ingredient sheet.
  - Place required attribution on the account/credits page.
- [ ] **Develop allergy and ingredient indicators** - reuse the existing ingredient glyph language after the allergy-warning behavior is specified
- [ ] **Finish the tactile illustration system** - richer member characters, photo-led memories, and less repetitive card composition
- [ ] **Add advanced archive storytelling** - seasonal/year recaps and richer household food-history summaries after the MVP is reliable
- [ ] **Add habit-driven merchant deals** - infer household ingredient patterns from cooking history, match current local merchant offers, and use them to shape next week's menu and shopping list; depends on reliable cooking history, normalized ingredients, store/location preferences, and licensed merchant feeds
- [ ] **Generate universal memory-photo thumbnails** - preserve HEIC/HEIF originals from iPhone uploads while generating JPEG or WebP derivatives for consistent web previews; depends on the deployment image-processing strategy

## Done

- [x] ~~Redesign authentication and household onboarding UX~~ (2026-09-03)
- [x] ~~Add the core end-to-end test~~ (2026-09-03)
- [x] ~~Verify responsive PWA behavior~~ (2026-09-03)
- [x] ~~Add domain unit tests~~ (2026-09-03)
- [x] ~~Add route loading and error states~~ (2026-09-03)
- [x] ~~Audit webhook secrets and RLS policies~~ (2026-09-02)
- [x] ~~Create an implementation checkpoint~~ (2026-09-02)
- [x] ~~Persist Telegram media safely~~ (2026-09-02)
- [x] ~~Add Telegram household-linking UI~~ (2026-09-02)
- [x] ~~Harden shopping-list generation~~ (2026-09-02)
- [x] ~~Complete grocery-find lifecycle~~ (2026-09-02)
- [x] ~~Separate Grocery Finds from Shopping~~ (2026-09-02)
- [x] ~~Standardize mutation feedback~~ (2026-09-02)
- [x] ~~Add account management and credits~~ (2026-09-02)
- [x] ~~Complete invitation acceptance and member management~~ (2026-09-02)
- [x] ~~Configure a development Supabase project~~ (2026-09-01)
- [x] ~~Resolve the active household from the signed-in member~~ (2026-09-01)
- [x] ~~Build household onboarding~~ (2026-09-01)
- [x] ~~Build authentication and session handling~~ (2026-09-01)
- [x] ~~Freeze Profile and Household MVP domain fields~~ (2026-08-31)
- [x] ~~Model would-make-again as explicit yes/no/maybe~~ (2026-08-31)
- [x] ~~Implement mock capture and Telegram draft review~~ (2026-08-31)
- [x] ~~Correct ingredient and cuisine hashtag classification~~ (2026-08-31)
- [x] ~~Connect recipes to weekly planning and cooking memories~~ (2026-08-31)
- [x] ~~Add week navigation, calendar view, and weekly memory~~ (2026-08-31)
- [x] ~~Add manual shopping items and practical checklist behavior~~ (2026-08-31)
- [x] ~~Add Memory Book filters and repeated cooking history~~ (2026-08-31)
- [x] ~~Add household member food preferences~~ (2026-08-31)

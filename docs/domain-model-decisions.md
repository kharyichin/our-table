# Our Table — Domain Model Decisions

Updated 2026-08-31 before generating Supabase TypeScript definitions.

## Household

- `id`, `name`, `inviteCode`, and `createdAt` remain the MVP household fields.
- The household is the primary data ownership and authorization boundary.
- `currentChapterTitle` is not a Household field. Every week is a distinct chapter, so the title belongs to `WeeklyPlan.chapterTitle`.
- `coverImage` is deferred. It has no current workflow and will be reconsidered with advanced archive storytelling rather than stored as an unused MVP field.

## Profile

- `displayName` is required.
- `avatarUrl` replaces the prototype `avatarEmoji` field. Initials remain the no-image fallback.
- `telegramUserId` is optional and unique when present. It will associate Telegram senders with authenticated profiles after Telegram linking is implemented.
- `dietaryPreferences`, `allergies`, and `favouriteCuisines` are stored as explicit string arrays.
- Allergy data is informational until ingredient-matching and warning rules are specified.

## Household membership

- Membership connects a Profile to a Household and carries the `owner` or `member` role.
- An account may eventually belong to multiple households; active-household selection is handled by application/session state, not duplicated on Profile.

## Weekly chapters

- Chapter title and weekly memory belong to `WeeklyPlan` because both vary by week.
- Home may display the active plan, but it does not own or duplicate weekly chapter data.

## Cooking Memory

- `wouldMakeAgain` is an explicit `yes`, `no`, or `maybe` value.
- A Cooking Memory belongs to a cooking event, not to the recipe definition itself.

-- Our Table — core schema
-- A shared, illustrated household food archive.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Households: the main unit of collaboration
-- ─────────────────────────────────────────────────────────────

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Table',
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 8),
  created_at timestamptz not null default now()
);

-- Profiles mirror auth.users so we can show names/avatars without exposing auth schema
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_emoji text not null default '🍽️',
  created_at timestamptz not null default now()
);

create type household_role as enum ('owner', 'member');

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role household_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (household_id, profile_id)
);

-- One Telegram group <-> one household
create table telegram_links (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  telegram_chat_id bigint not null unique,
  chat_title text,
  linked_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Recipes: the Idea Garden and beyond
-- ─────────────────────────────────────────────────────────────

create type recipe_status as enum ('idea', 'planned', 'cooked', 'repeated', 'archived');

create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  title text not null,
  source_url text,
  description text,
  ingredients text[] not null default '{}',
  instructions text,
  cuisine_tags text[] not null default '{}',
  ingredient_tags text[] not null default '{}',
  illustration_seed text not null default gen_random_uuid()::text,
  status recipe_status not null default 'idea',
  discovered_date date not null default current_date,
  discovered_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_household_idx on recipes (household_id);
create index recipes_status_idx on recipes (household_id, status);
create index recipes_cuisine_tags_idx on recipes using gin (cuisine_tags);
create index recipes_ingredient_tags_idx on recipes using gin (ingredient_tags);

-- ─────────────────────────────────────────────────────────────
-- Grocery finds: temporary weekly planning inputs
-- ─────────────────────────────────────────────────────────────

create table grocery_finds (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  store text not null,
  ingredient text not null,
  price numeric(10, 2),
  description text,
  source_url text,
  image_url text,
  expiry_date date,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index grocery_finds_household_idx on grocery_finds (household_id);
create index grocery_finds_store_idx on grocery_finds (household_id, store);
create index grocery_finds_expiry_idx on grocery_finds (household_id, expiry_date);

create table grocery_find_recipes (
  grocery_find_id uuid not null references grocery_finds (id) on delete cascade,
  recipe_id uuid not null references recipes (id) on delete cascade,
  primary key (grocery_find_id, recipe_id)
);

-- ─────────────────────────────────────────────────────────────
-- Weekly Story: the storybook planning spread
-- ─────────────────────────────────────────────────────────────

create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  chapter_title text not null default 'This Week''s Chapter',
  week_start_date date not null,
  created_at timestamptz not null default now(),
  unique (household_id, week_start_date)
);

create type meal_state as enum ('planned', 'cooked', 'skipped', 'replaced', 'eating_out');

create table meal_cards (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references weekly_plans (id) on delete cascade,
  day_index smallint not null check (day_index between 0 and 6),
  recipe_id uuid references recipes (id) on delete set null,
  state meal_state not null default 'planned',
  note text,
  created_at timestamptz not null default now()
);

create index meal_cards_plan_idx on meal_cards (weekly_plan_id);

-- ─────────────────────────────────────────────────────────────
-- Shopping lists: generated from the weekly plan
-- ─────────────────────────────────────────────────────────────

create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references weekly_plans (id) on delete cascade,
  generated_at timestamptz not null default now(),
  unique (weekly_plan_id)
);

create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references shopping_lists (id) on delete cascade,
  name text not null,
  quantity text,
  category text not null default 'Other',
  store text,
  have_it boolean not null default false,
  checked boolean not null default false,
  substitution text,
  source_meal_card_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index shopping_items_list_idx on shopping_items (shopping_list_id);

-- ─────────────────────────────────────────────────────────────
-- Cooking memories: permanent household history
-- ─────────────────────────────────────────────────────────────

create table cooking_memories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  recipe_id uuid not null references recipes (id) on delete cascade,
  meal_card_id uuid references meal_cards (id) on delete set null,
  date_cooked date not null default current_date,
  members_present uuid[] not null default '{}',
  photo_url text,
  note text,
  rating smallint check (rating between 1 and 5),
  would_make_again boolean,
  changes_made text,
  occasion text,
  created_at timestamptz not null default now()
);

create index cooking_memories_household_idx on cooking_memories (household_id);
create index cooking_memories_recipe_idx on cooking_memories (recipe_id);
create index cooking_memories_date_idx on cooking_memories (household_id, date_cooked);

-- ─────────────────────────────────────────────────────────────
-- Telegram captures: the inbox for raw group messages
-- ─────────────────────────────────────────────────────────────

create type capture_status as enum ('draft_recipe', 'draft_grocery_find', 'needs_review', 'dismissed', 'linked');

create table captures (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  telegram_chat_id bigint not null,
  telegram_message_id bigint not null,
  sender_name text,
  raw_text text,
  urls text[] not null default '{}',
  image_urls text[] not null default '{}',
  hashtags text[] not null default '{}',
  message_link text,
  status capture_status not null default 'needs_review',
  linked_recipe_id uuid references recipes (id) on delete set null,
  linked_grocery_find_id uuid references grocery_finds (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (telegram_chat_id, telegram_message_id)
);

create index captures_household_idx on captures (household_id, status);

-- ─────────────────────────────────────────────────────────────
-- updated_at trigger for recipes
-- ─────────────────────────────────────────────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_set_updated_at
  before update on recipes
  for each row execute function set_updated_at();

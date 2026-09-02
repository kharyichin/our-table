-- Row Level Security — every table is scoped to the caller's household(s).
-- Simple shared permission model: any household member can read/write
-- shared household data; only members can join via invite code.

create or replace function is_household_member(target_household_id uuid) returns boolean as $$
  select exists (
    select 1 from household_members hm
    where hm.household_id = target_household_id
      and hm.profile_id = auth.uid()
  );
$$ language sql security definer stable;

alter table households enable row level security;
alter table profiles enable row level security;
alter table household_members enable row level security;
alter table telegram_links enable row level security;
alter table recipes enable row level security;
alter table grocery_finds enable row level security;
alter table grocery_find_recipes enable row level security;
alter table weekly_plans enable row level security;
alter table meal_cards enable row level security;
alter table shopping_lists enable row level security;
alter table shopping_items enable row level security;
alter table cooking_memories enable row level security;
alter table captures enable row level security;

-- Profiles: readable by anyone in a shared household; editable by self.
create policy "profiles are self-manageable" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles visible to household co-members" on profiles
  for select using (
    exists (
      select 1 from household_members mine
      join household_members theirs on theirs.household_id = mine.household_id
      where mine.profile_id = auth.uid() and theirs.profile_id = profiles.id
    )
  );

-- Households: visible/editable to members.
create policy "households visible to members" on households
  for select using (is_household_member(id));

create policy "households insertable by authenticated users" on households
  for insert with check (auth.uid() is not null);

create policy "households editable by members" on households
  for update using (is_household_member(id));

-- Household members: visible to co-members; a user may insert their own membership
-- (used for invite-link join flow).
create policy "household_members visible to co-members" on household_members
  for select using (is_household_member(household_id));

create policy "household_members self join" on household_members
  for insert with check (profile_id = auth.uid());

create policy "household_members self leave" on household_members
  for delete using (profile_id = auth.uid());

-- Telegram links: members only.
create policy "telegram_links scoped to members" on telegram_links
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

-- Recipes
create policy "recipes scoped to members" on recipes
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

-- Grocery finds
create policy "grocery_finds scoped to members" on grocery_finds
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "grocery_find_recipes scoped to members" on grocery_find_recipes
  for all using (
    exists (select 1 from grocery_finds gf where gf.id = grocery_find_id and is_household_member(gf.household_id))
  ) with check (
    exists (select 1 from grocery_finds gf where gf.id = grocery_find_id and is_household_member(gf.household_id))
  );

-- Weekly plans / meal cards
create policy "weekly_plans scoped to members" on weekly_plans
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "meal_cards scoped to members" on meal_cards
  for all using (
    exists (select 1 from weekly_plans wp where wp.id = weekly_plan_id and is_household_member(wp.household_id))
  ) with check (
    exists (select 1 from weekly_plans wp where wp.id = weekly_plan_id and is_household_member(wp.household_id))
  );

-- Shopping lists / items
create policy "shopping_lists scoped to members" on shopping_lists
  for all using (
    exists (select 1 from weekly_plans wp where wp.id = weekly_plan_id and is_household_member(wp.household_id))
  ) with check (
    exists (select 1 from weekly_plans wp where wp.id = weekly_plan_id and is_household_member(wp.household_id))
  );

create policy "shopping_items scoped to members" on shopping_items
  for all using (
    exists (
      select 1 from shopping_lists sl
      join weekly_plans wp on wp.id = sl.weekly_plan_id
      where sl.id = shopping_list_id and is_household_member(wp.household_id)
    )
  ) with check (
    exists (
      select 1 from shopping_lists sl
      join weekly_plans wp on wp.id = sl.weekly_plan_id
      where sl.id = shopping_list_id and is_household_member(wp.household_id)
    )
  );

-- Cooking memories
create policy "cooking_memories scoped to members" on cooking_memories
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

-- Captures (Telegram inbox)
create policy "captures scoped to members" on captures
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

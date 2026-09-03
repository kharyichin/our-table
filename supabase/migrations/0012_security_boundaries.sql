-- Harden database boundaries that must remain true even when requests bypass
-- the app UI or a server action receives forged identifiers.

alter function is_household_member(uuid) set search_path = public;
alter function is_household_owner(uuid) set search_path = public;

-- New invitation codes have 128 bits of entropy instead of the original
-- eight-character code. Existing links remain valid until a rotation UI lands.
alter table households alter column invite_code
  set default encode(gen_random_bytes(16), 'hex');

-- Members may read the Telegram connection; only owners may change it.
drop policy if exists "telegram_links scoped to members" on telegram_links;
drop policy if exists "telegram_links visible to members" on telegram_links;
drop policy if exists "telegram_links managed by owners" on telegram_links;
create policy "telegram_links visible to members" on telegram_links
  for select using (is_household_member(household_id));
create policy "telegram_links managed by owners" on telegram_links
  for all using (is_household_owner(household_id))
  with check (is_household_owner(household_id));

create or replace function enforce_household_relationships() returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_household uuid;
  related_household uuid;
  source_id uuid;
begin
  if tg_table_name = 'grocery_find_recipes' then
    select household_id into parent_household from grocery_finds where id = new.grocery_find_id;
    select household_id into related_household from recipes where id = new.recipe_id;
    if parent_household is null or related_household is distinct from parent_household then
      raise exception 'grocery find and recipe must belong to the same household';
    end if;
  elsif tg_table_name = 'meal_cards' and new.recipe_id is not null then
    select household_id into parent_household from weekly_plans where id = new.weekly_plan_id;
    select household_id into related_household from recipes where id = new.recipe_id;
    if parent_household is null or related_household is distinct from parent_household then
      raise exception 'meal and recipe must belong to the same household';
    end if;
  elsif tg_table_name = 'cooking_memories' then
    select household_id into related_household from recipes where id = new.recipe_id;
    if related_household is distinct from new.household_id then
      raise exception 'memory and recipe must belong to the same household';
    end if;
    if new.meal_card_id is not null then
      select wp.household_id into related_household
      from meal_cards mc join weekly_plans wp on wp.id = mc.weekly_plan_id
      where mc.id = new.meal_card_id;
      if related_household is distinct from new.household_id then
        raise exception 'memory and meal must belong to the same household';
      end if;
    end if;
  elsif tg_table_name = 'captures' then
    if new.linked_recipe_id is not null then
      select household_id into related_household from recipes where id = new.linked_recipe_id;
      if related_household is distinct from new.household_id then
        raise exception 'capture and recipe must belong to the same household';
      end if;
    end if;
    if new.linked_grocery_find_id is not null then
      select household_id into related_household from grocery_finds where id = new.linked_grocery_find_id;
      if related_household is distinct from new.household_id then
        raise exception 'capture and grocery find must belong to the same household';
      end if;
    end if;
  elsif tg_table_name = 'shopping_items' then
    select wp.household_id into parent_household
    from shopping_lists sl join weekly_plans wp on wp.id = sl.weekly_plan_id
    where sl.id = new.shopping_list_id;
    foreach source_id in array new.source_meal_card_ids loop
      select wp.household_id into related_household
      from meal_cards mc join weekly_plans wp on wp.id = mc.weekly_plan_id
      where mc.id = source_id;
      if related_household is distinct from parent_household then
        raise exception 'shopping item sources must belong to the same household';
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists grocery_find_recipes_household_guard on grocery_find_recipes;
create trigger grocery_find_recipes_household_guard before insert or update on grocery_find_recipes
  for each row execute function enforce_household_relationships();
drop trigger if exists meal_cards_household_guard on meal_cards;
create trigger meal_cards_household_guard before insert or update on meal_cards
  for each row execute function enforce_household_relationships();
drop trigger if exists cooking_memories_household_guard on cooking_memories;
create trigger cooking_memories_household_guard before insert or update on cooking_memories
  for each row execute function enforce_household_relationships();
drop trigger if exists captures_household_guard on captures;
create trigger captures_household_guard before insert or update on captures
  for each row execute function enforce_household_relationships();
drop trigger if exists shopping_items_household_guard on shopping_items;
create trigger shopping_items_household_guard before insert or update on shopping_items
  for each row execute function enforce_household_relationships();

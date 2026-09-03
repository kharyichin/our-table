-- Avoid referencing fields from the wrong trigger row type. PostgreSQL may
-- evaluate both sides of a boolean expression, so table checks and NEW field
-- checks must be nested rather than combined with AND.
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
  elsif tg_table_name = 'meal_cards' then
    if new.recipe_id is not null then
      select household_id into parent_household from weekly_plans where id = new.weekly_plan_id;
      select household_id into related_household from recipes where id = new.recipe_id;
      if parent_household is null or related_household is distinct from parent_household then
        raise exception 'meal and recipe must belong to the same household';
      end if;
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

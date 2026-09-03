-- Diner count belongs to a cooking event, because a recipe may feed a
-- different number of people each time it is planned.
alter table meal_cards add column if not exists diner_count smallint
  check (diner_count between 1 and 50);

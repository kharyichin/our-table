-- Manual items must remain manual even when they temporarily match a planned
-- recipe ingredient. This makes shopping-list regeneration non-destructive.
alter table shopping_items
  add column if not exists is_manual boolean not null default false;

-- Existing rows without recipe sources were created through the manual form.
update shopping_items
set is_manual = true
where cardinality(source_meal_card_ids) = 0;

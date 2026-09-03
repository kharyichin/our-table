-- Preserve the source site's recipe yield while keeping it household-editable.
alter table recipes add column if not exists servings text;

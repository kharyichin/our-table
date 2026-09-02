-- A short household-authored closing note for each weekly chapter.
alter table weekly_plans add column if not exists weekly_memory text;

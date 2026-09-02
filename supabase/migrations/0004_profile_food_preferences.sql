alter table profiles
  add column if not exists dietary_preferences text[] not null default '{}',
  add column if not exists allergies text[] not null default '{}',
  add column if not exists favourite_cuisines text[] not null default '{}';

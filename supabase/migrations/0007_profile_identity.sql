-- Profiles use durable images and optional Telegram identity. Emoji avatars
-- belonged to the prototype and are no longer part of the interface model.
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists telegram_user_id bigint;

create unique index if not exists profiles_telegram_user_id_unique
  on profiles (telegram_user_id)
  where telegram_user_id is not null;

alter table profiles drop column if exists avatar_emoji;

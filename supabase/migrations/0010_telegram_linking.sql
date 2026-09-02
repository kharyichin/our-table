-- One household <-> one Telegram group, linked through a short-lived code.
create unique index if not exists telegram_links_household_unique
  on telegram_links (household_id);

create table if not exists telegram_link_tokens (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references households (id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references profiles (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table telegram_link_tokens enable row level security;

create policy "telegram_link_tokens owner managed" on telegram_link_tokens
  for all using (
    exists (
      select 1 from household_members hm
      where hm.household_id = telegram_link_tokens.household_id
        and hm.profile_id = auth.uid()
        and hm.role = 'owner'
    )
  ) with check (
    exists (
      select 1 from household_members hm
      where hm.household_id = telegram_link_tokens.household_id
        and hm.profile_id = auth.uid()
        and hm.role = 'owner'
    )
  );

create or replace function consume_telegram_link_token(
  requested_token_hash text,
  requested_chat_id bigint,
  requested_chat_title text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  link_token telegram_link_tokens%rowtype;
  existing_household uuid;
  existing_chat bigint;
begin
  select * into link_token
  from telegram_link_tokens
  where token_hash = requested_token_hash
    and expires_at > now()
  for update;

  if not found then return 'invalid'; end if;

  select household_id into existing_household
  from telegram_links where telegram_chat_id = requested_chat_id;
  if existing_household is not null then
    if existing_household = link_token.household_id then return 'already_linked'; end if;
    return 'chat_taken';
  end if;

  select telegram_chat_id into existing_chat
  from telegram_links where household_id = link_token.household_id;
  if existing_chat is not null then return 'household_taken'; end if;

  insert into telegram_links (household_id, telegram_chat_id, chat_title)
  values (link_token.household_id, requested_chat_id, nullif(trim(requested_chat_title), ''));

  delete from telegram_link_tokens where id = link_token.id;
  return 'linked';
end;
$$;

revoke all on function consume_telegram_link_token(text, bigint, text) from public;
revoke all on function consume_telegram_link_token(text, bigint, text) from anon;
revoke all on function consume_telegram_link_token(text, bigint, text) from authenticated;
grant execute on function consume_telegram_link_token(text, bigint, text) to service_role;

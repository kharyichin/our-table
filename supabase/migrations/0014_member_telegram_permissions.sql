-- Telegram is a shared household capture layer. Any household member may
-- connect or disconnect the household's group; non-members remain excluded.
drop policy if exists "telegram_link_tokens owner managed" on telegram_link_tokens;
drop policy if exists "telegram_link_tokens member managed" on telegram_link_tokens;
create policy "telegram_link_tokens member managed" on telegram_link_tokens
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

drop policy if exists "telegram_links managed by owners" on telegram_links;
drop policy if exists "telegram_links managed by members" on telegram_links;
create policy "telegram_links managed by members" on telegram_links
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

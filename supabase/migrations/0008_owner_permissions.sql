-- Align database permissions with household management rules. Invitation
-- acceptance is performed by an authenticated server action after validating
-- the private invite code, so arbitrary client-side self-joining is removed.

create or replace function is_household_owner(target_household_id uuid) returns boolean as $$
  select exists (
    select 1 from household_members hm
    where hm.household_id = target_household_id
      and hm.profile_id = auth.uid()
      and hm.role = 'owner'
  );
$$ language sql security definer stable set search_path = public;

drop policy if exists "households editable by members" on households;
drop policy if exists "households editable by owners" on households;
create policy "households editable by owners" on households
  for update using (is_household_owner(id)) with check (is_household_owner(id));

drop policy if exists "household_members self join" on household_members;

drop policy if exists "household_members self leave" on household_members;
create policy "household_members may leave" on household_members
  for delete using (profile_id = auth.uid() and role <> 'owner');

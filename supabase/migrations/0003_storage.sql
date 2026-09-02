-- Storage bucket for cooking memory photos. Public read (photos are shown
-- inside the app and Memory Book), writes restricted to household members.

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;

create policy "memory photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'memory-photos');

create policy "authenticated users can upload memory photos"
  on storage.objects for insert
  with check (bucket_id = 'memory-photos' and auth.uid() is not null);

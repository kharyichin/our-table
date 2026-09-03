-- Cooking memories are household history, not public assets. Uploads now pass
-- through an authenticated server action and reads through a membership check.
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id = 'memory-photos';

drop policy if exists "memory photos are publicly readable" on storage.objects;
drop policy if exists "authenticated users can upload memory photos" on storage.objects;

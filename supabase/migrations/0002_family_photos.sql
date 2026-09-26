-- Private profile photo storage for Vansh.
alter table public.persons add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('family-photos', 'family-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Family members can view family photos" on storage.objects;
create policy "Family members can view family photos"
on storage.objects for select to authenticated
using (bucket_id = 'family-photos' and public.is_family_member((storage.foldername(name))[1]::uuid));

drop policy if exists "Family editors can upload family photos" on storage.objects;
create policy "Family editors can upload family photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'family-photos' and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner','editor']::public.family_role[]));

drop policy if exists "Family editors can update family photos" on storage.objects;
create policy "Family editors can update family photos"
on storage.objects for update to authenticated
using (bucket_id = 'family-photos' and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner','editor']::public.family_role[]))
with check (bucket_id = 'family-photos' and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner','editor']::public.family_role[]));

drop policy if exists "Family editors can delete family photos" on storage.objects;
create policy "Family editors can delete family photos"
on storage.objects for delete to authenticated
using (bucket_id = 'family-photos' and public.has_family_role((storage.foldername(name))[1]::uuid, array['owner','editor']::public.family_role[]));

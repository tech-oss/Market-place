-- Optional buyer-uploaded photo evidence on a return request.

alter table orders add column if not exists return_photo_url text;

insert into storage.buckets (id, name, public)
values ('return-photos', 'return-photos', true)
on conflict (id) do nothing;

drop policy if exists "return photos public read" on storage.objects;
drop policy if exists "return photos auth write"  on storage.objects;

create policy "return photos public read" on storage.objects
  for select using (bucket_id = 'return-photos');

create policy "return photos auth write" on storage.objects
  for insert with check (bucket_id = 'return-photos' and auth.role() = 'authenticated');

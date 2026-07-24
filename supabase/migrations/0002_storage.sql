-- Storage buckets for product media (public) and KYC documents (private).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- product-images: anyone can read; authenticated users can upload/manage.
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product images auth write" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "product images auth update" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- kyc-documents: private. Owner (path prefixed with their uid) or admin only.
create policy "kyc owner read" on storage.objects
  for select using (
    bucket_id = 'kyc-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );

create policy "kyc owner write" on storage.objects
  for insert with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

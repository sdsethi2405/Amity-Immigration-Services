-- Public media buckets for blog covers and page images

insert into storage.buckets (id, name, public)
values
  ('blog-covers', 'blog-covers', true),
  ('page-images', 'page-images', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read blog covers'
  ) then
    create policy "Public read blog covers"
      on storage.objects for select
      using (bucket_id = 'blog-covers');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read page images'
  ) then
    create policy "Public read page images"
      on storage.objects for select
      using (bucket_id = 'page-images');
  end if;
end $$;

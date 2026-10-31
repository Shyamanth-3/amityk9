-- AmityK9: service photos + gallery. Run once in Supabase → SQL Editor, after setup.sql.

-- ───────────── service photos ─────────────
-- [{ "path": "services/<id>/<file>.webp", "url": "https://…/media/services/…", "alt": "…" }], first one is the cover
alter table services add column images jsonb not null default '[]';

-- ───────────── gallery ─────────────
create table media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('photo', 'video')),
  path text,                                   -- storage path, photos only
  url text not null,                           -- public image URL, or the video link
  caption text not null default '' check (char_length(caption) <= 200),
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  check ((kind = 'photo') = (path is not null))
);
alter table media enable row level security;
create policy media_public_read on media for select to anon, authenticated using (published);
create policy media_admin_all on media for all to authenticated using (is_admin()) with check (is_admin());

-- ───────────── storage bucket ─────────────
-- Public bucket: anyone can view the images by URL; only owners can upload, change or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy media_owner_select on storage.objects for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy media_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy media_owner_update on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy media_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

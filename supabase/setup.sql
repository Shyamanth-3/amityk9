-- AmityK9 database setup (admin demo).
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run. Run it once.

-- ───────────── types ─────────────
create type service_status as enum ('draft', 'published', 'unpublished', 'archived');
create type booking_status as enum ('new', 'contacted', 'awaiting_customer', 'confirmed', 'completed', 'cancelled');

-- ───────────── owners ─────────────
-- Being logged in is not enough: only users listed here can use the admin dashboard.
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- ───────────── services ─────────────
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  summary text not null default '' check (char_length(summary) <= 300),
  description text not null default '' check (char_length(description) <= 4000),
  inclusions text[] not null default '{}',
  status service_status not null default 'draft',          -- new services stay hidden until published
  enquiry_only boolean not null default false,             -- "Contact for pricing"
  price_from integer check (price_from >= 0),
  duration text not null default '',
  packages jsonb not null default '[]',                    -- [{ "name", "price", "visits", "note" }]
  service_area text not null default '',
  availability text not null default '',
  temporarily_unavailable boolean not null default false,
  booking_enabled boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger services_touch before update on services for each row execute function touch_updated_at();

-- ───────────── bookings ─────────────
create sequence booking_seq start 1001;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  request_code text unique not null default ('AK-' || nextval('booking_seq')),
  created_at timestamptz not null default now(),
  service_id uuid not null references services (id) on delete restrict,   -- services are archived, never deleted
  service_name text not null,                                              -- snapshot, survives renames
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (phone ~ '^\+?[0-9]{10,13}$'),
  pet_name text not null default '' check (char_length(pet_name) <= 60),
  pet_type text not null default '' check (char_length(pet_type) <= 40),
  community text not null default '' check (char_length(community) <= 120),
  preferred_date date,
  preferred_time text not null default '' check (char_length(preferred_time) <= 40),
  notes text not null default '' check (char_length(notes) <= 1000),
  status booking_status not null default 'new',
  internal_notes text not null default '' check (char_length(internal_notes) <= 2000)
);
create index bookings_created_idx on bookings (created_at desc);

-- ───────────── row level security ─────────────
alter table admins enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;

create policy admins_read_self on admins for select to authenticated using (user_id = auth.uid());

create policy services_public_read on services for select to anon, authenticated using (status = 'published');
create policy services_admin_all on services for all to authenticated using (is_admin()) with check (is_admin());

-- the public never reads or writes bookings directly; they go through submit_booking() below
create policy bookings_admin_all on bookings for all to authenticated using (is_admin()) with check (is_admin());

-- ───────────── public booking submission ─────────────
-- Saves an enquiry for a published, bookable service and returns its request ID (e.g. AK-1001).
create function submit_booking(
  p_service uuid, p_name text, p_phone text, p_pet_name text, p_pet_type text,
  p_community text, p_date date, p_time text, p_notes text
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  s services;
  code text;
begin
  select * into s from services
   where id = p_service and status = 'published' and booking_enabled and not temporarily_unavailable;
  if not found then
    raise exception 'service_unavailable';
  end if;

  insert into bookings (service_id, service_name, customer_name, phone, pet_name, pet_type, community, preferred_date, preferred_time, notes)
  values (s.id, s.name, trim(p_name), regexp_replace(coalesce(p_phone, ''), '[\s-]', '', 'g'), trim(coalesce(p_pet_name, '')),
          trim(coalesce(p_pet_type, '')), trim(coalesce(p_community, '')), p_date, trim(coalesce(p_time, '')), trim(coalesce(p_notes, '')))
  returning request_code into code;

  return code;
end $$;

grant execute on function submit_booking(uuid, text, text, text, text, text, date, text, text) to anon, authenticated;

-- ───────────── starting services (the two on the site today) ─────────────
insert into services (slug, name, summary, description, inclusions, status, price_from, duration, packages, service_area, availability, display_order) values
('pet-walking', 'Pet walking',
 'Daily exercise, fresh air and a happier, healthier pet.',
 'Unhurried, supervised walks inside your gated community, with the same walker every week and an update after every walk.',
 array['Safe, supervised walks', 'Fresh air and exercise', 'Suitable for all breeds and sizes', 'Update after each walk, photos if you like'],
 'published', 2499, 'About 30 min per walk',
 '[{"name":"Bronze","price":2499,"visits":12,"note":"3 days a week"},{"name":"Silver","price":3999,"visits":16,"note":"4 days a week"},{"name":"Gold","price":4999,"visits":24,"note":"6 days a week"}]',
 'Gated communities in Hyderabad', 'Monday to Saturday', 1),
('pet-sitting', 'Pet sitting',
 'Loving care for your pet when you''re away.',
 'Home visits of 45 to 60 minutes: feeding, play, litter and clean-up, medicines if required, with photo updates.',
 array['Feeding and fresh water', 'Playtime and company', 'Litter box and clean-up', 'Medicines, if required', 'Regular photo updates'],
 'published', 2499, '45–60 min per visit',
 '[{"name":"Bronze","price":2499,"visits":8,"note":"2 days a week"},{"name":"Silver","price":3999,"visits":12,"note":"3 days a week"},{"name":"Gold","price":4999,"visits":16,"note":"4 days a week"}]',
 'Gated communities in Hyderabad', 'Monday to Saturday', 2);

-- ───────────── make yourself the owner ─────────────
-- 1. Supabase → Authentication → Users → Add user → Create new user (tick "Auto Confirm User").
-- 2. Then run this line with that email:
--    insert into admins (user_id) select id from auth.users where email = 'owner@example.com';

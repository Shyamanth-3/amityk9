-- AmityK9: booking spam limits. Run once in Supabase → SQL Editor, after setup.sql and 002_media.sql.
--
-- Why: submit_booking() is `security definer` and granted to anon, and the anon key ships to every
-- browser. Anyone can call it straight from the Supabase REST API (POST /rest/v1/rpc/submit_booking),
-- skipping the website's honeypot and date check. So the checks that matter have to live here.
--
-- This replaces submit_booking() with the same signature (grants and the website call are unchanged) and adds:
--   • date_in_past         – preferred date earlier than today in India (Asia/Kolkata)
--   • rate_limited_phone   – too many requests from one mobile number in a rolling window
--   • rate_limited_global  – too many requests from everyone in a rolling window
-- service_unavailable is unchanged. The website maps each one to a friendly message (src/app/book/actions.ts).
--
-- Trade-off of the global limit: it is a circuit breaker, not a per-person limit. Someone who rotates
-- phone numbers can use up the whole window, and then real customers are turned away (told to message
-- on WhatsApp) until it rolls over. We accept that because the alternative is an unbounded flood of junk
-- rows in the owner's inbox; the numbers below sit far above AmityK9's real volume, so normal days never
-- get near them. The database cannot see a visitor's IP address reliably, so per-IP limits belong in
-- front of the site (Vercel Firewall) – see the rate-limiting notes in the bug-5 report.

-- Per-phone lookups: phones are stored with spaces and dashes stripped but may or may not start with
-- +91 / 91 / 0, so they are compared on their last 10 digits. The query below uses exactly this expression.
-- Global counts use the existing bookings_created_idx (created_at desc).
create index if not exists bookings_phone_recent_idx on bookings (right(phone, 10), created_at desc);

create or replace function submit_booking(
  p_service uuid, p_name text, p_phone text, p_pet_name text, p_pet_type text,
  p_community text, p_date date, p_time text, p_notes text
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  -- ── limits: change these, re-run the file ──
  PHONE_MAX      constant integer  := 3;                    -- requests per number…
  PHONE_WINDOW   constant interval := interval '24 hours';  -- …in this rolling window
  GLOBAL_MAX     constant integer  := 30;                   -- requests from everyone…
  GLOBAL_WINDOW  constant interval := interval '1 hour';    -- …in this rolling window
  BUSINESS_TZ    constant text     := 'Asia/Kolkata';
  -- any fixed number; every submit_booking call takes this lock, nothing else does
  LIMIT_LOCK     constant bigint   := 4103580915001;

  s services;
  code text;
  phone_norm text := regexp_replace(coalesce(p_phone, ''), '[\s-]', '', 'g');
begin
  -- dates are the customer's local (India) date, not the server's UTC date
  if p_date is not null and p_date < (now() at time zone BUSINESS_TZ)::date then
    raise exception 'date_in_past';
  end if;

  select * into s from services
   where id = p_service and status = 'published' and booking_enabled and not temporarily_unavailable;
  if not found then
    raise exception 'service_unavailable';
  end if;

  -- Concurrency: without a lock, N parallel calls would all count the same rows and all insert.
  -- The transaction-scoped lock queues submissions one at a time until this call commits or fails
  -- (each PostgREST RPC is its own transaction). Each count below runs after the lock is held, and
  -- under READ COMMITTED takes a fresh snapshot, so it sees every booking committed before it.
  -- Holding it costs a couple of indexed counts and one insert, which is fine at AmityK9's volume.
  perform pg_advisory_xact_lock(LIMIT_LOCK);

  if (select count(*) from bookings
       where right(phone, 10) = right(phone_norm, 10)
         and created_at > now() - PHONE_WINDOW) >= PHONE_MAX then
    raise exception 'rate_limited_phone';
  end if;

  if (select count(*) from bookings where created_at > now() - GLOBAL_WINDOW) >= GLOBAL_MAX then
    raise exception 'rate_limited_global';
  end if;

  insert into bookings (service_id, service_name, customer_name, phone, pet_name, pet_type, community, preferred_date, preferred_time, notes)
  values (s.id, s.name, trim(p_name), phone_norm, trim(coalesce(p_pet_name, '')),
          trim(coalesce(p_pet_type, '')), trim(coalesce(p_community, '')), p_date, trim(coalesce(p_time, '')), trim(coalesce(p_notes, '')))
  returning request_code into code;

  return code;
end $$;

-- `create or replace` keeps the existing grants; repeated here so the file also works on its own.
grant execute on function submit_booking(uuid, text, text, text, text, text, date, text, text) to anon, authenticated;

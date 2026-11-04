# AmityK9: supervisor engineering report

Date: 4 November 2026 · Branch: `fix/supervisor` (built on `fix/review-bugs`) · Base: `admin-demo` at `d48778f`

## A. Executive summary

**Starting point.** `admin-demo` had the ten review bugs. I reproduced bugs 1, 3, 6, 7 and 8 live against a local database (section C). All ten agents delivered. Each one's work reached `fix/review-bugs` intact: every earlier push matches its rebased commit, and no rebase dropped any agent's work.

**Where it ended up.** The combined branch builds, type-checks and runs. I tested it in a browser against a local Supabase stack: real Supabase Auth (GoTrue), real Storage API, PostgREST and Supabase's Postgres image, with all three SQL files applied in order.

- **Final regression run: 89/89 end-to-end checks passed.** They cover booking, limits, RLS, admin sign-in, the service lifecycle, photo upload and removal, the gallery, failed-save notices, tampering and CSV export.
- 33 page loads (11 pages × 3 widths) showed no app errors.
- The CSV unit check passed 28/28.
- `tsc` and `next build` are clean.

**Issues found by supervision.**
- **2 defects, both fixed and verified:**
  - S1: an expired admin session showed a crash page. This was already on `admin-demo`; no agent caused it.
  - S2: the CSV export failed outright when the API row cap is below 1000.
- **10 smaller limitations, left open with reasons** (section F).
- No agent introduced a regression that I could find.

**Final status: FUNCTIONALLY STABLE WITH LIMITATIONS.** I tested Auth and Storage on a self-hosted local stack, not on the hosted Supabase project. Real iPhone/Safari was not available; I simulated Safari's missing WebP support in Chromium. The `next/image` display of Supabase photos could not run locally.

## B. Agent evaluations

| Agent | Area | Status | Changes reviewed | Verified by me | Remaining issues |
|---|---|---|---|---|---|
| 1 | Forms wiped on error | Delivered `03a0668` (rebased; earlier push `dfca20d` same change, adapted to bug 9's imports) | `keepInput.ts`, BookingForm, ServiceForm, MediaTools VideoForm, login | Booking: 4 error types and 3 DB errors all keep every field. Service form keeps input after validation, duplicate-address and forced write failures. Login keeps the email and clears the password. Video form keeps input on error and clears after success. Baseline: `admin-demo` cleared name/notes. | None |
| 2 | iPhone uploads | Delivered `4381815` (= `bd6e824`) | `upload.ts`, `MEDIA_PATH` now allows `.jpg` | Real Storage: normal upload gives `.webp` / `image/webp`. With `toBlob` patched to behave like Safari (PNG for WebP), it gives `.jpg` / `image/jpeg`. A 4032×3024 photo was shrunk to 26 KB. Invalid file reported by name. Public URL serves the right type. | Real iPhone/Safari not available (F6). Files with an empty MIME type are rejected (F7). |
| 3 | Enquiry-only erases price | Delivered `f0464f1` | ServiceForm keeps price/duration in state and as hidden inputs | Tick → save keeps 1500 and the duration. Untick shows them again. Public and admin lists show "Contact for pricing", then "From ₹1,500". Baseline: `admin-demo` saved `price_from = NULL`. | None |
| 4 | False privacy page | Delivered `ede3081` (= `8331e47`) | `privacy/page.tsx` | Claims checked against the running site: the only third-party request on public pages is `i.ytimg.com`, public pages set no cookies, the YouTube player is `youtube-nocookie.com` on tap, Instagram is a link-out, and the booking form saves exactly the listed fields. | None |
| 5 | Booking spam and limits | Delivered `157709e` (= `41f5160` = `c1eed07`) | `003_booking_limits.sql`, book action error mapping, India-date check | Direct REST RPC: past date gives `date_in_past`. 20 parallel calls from one phone saved exactly 3. 40 parallel calls from different phones saved exactly 30. `+91` and plain forms count as one number. Every DB error shows the right friendly message in the browser. | Its commit points to a "bug-5 report" for rate-limit notes, but no report reached git, so I wrote the audit (F1–F3). |
| 6 | Failed saves look successful | Delivered `04ed44a` | `fail.ts`, `Notice.tsx`, panel layout, bookings/services/media actions | With a test trigger forcing every update to fail: booking save, unpublish, reorder, service edit and gallery save each show an on-page error. `?error=` is removed from the address bar, and the notice clears on the next button press. Baseline: `admin-demo` showed nothing. | F8 (an update matching 0 rows still says "Saved") |
| 7 | CSV truncated at 1000 | Delivered `532b5ee` | `pages.ts`, export route | 2,508 rows exported with the PostgREST cap at 1000, no duplicates, and ties at page boundaries kept. Baseline: `admin-demo` exported 1,000. | I found and fixed S2 (cap below 1000 gave a 500). |
| 8 | Wrong services label | Delivered `37339b3` | `services/page.tsx`, CSS | Bookings off shows "Enquiries on WhatsApp", paused shows "Temporarily paused", otherwise "Taking bookings". Baseline: `admin-demo` said "Taking bookings" with bookings off. | None |
| 9 | Orphaned uploads | Delivered `334797b` (= `894fc19`) | `storage.ts`, `admin/uploads.ts`, ServiceForm, MediaTools, media actions | Real Storage: removing an unsaved photo deletes it, and Cancel deletes fresh uploads but keeps saved ones. A saved photo removed in the form is deleted only after the save succeeds. The saved photo survives the redirect/unmount. Deleting from the gallery removes the row and the file. Forged `discardUploads` call: live service and gallery photos were kept. | F4 (closing the tab still orphans uploads; the agent documented this) |
| 10 | CSV formula guard | Delivered `8337798` (= `5076cc7`) | `csv.ts`, `scripts/check-csv.mjs` | `npm run check:csv` 28/28. In the live export, `=HYPERLINK`, `+cmd`, `-2+3`, `@SUM`, a leading tab, leading spaces and the full-width `＝` were all prefixed with `'`. Embedded quotes, commas and newlines stay in one cell, and phones are untouched. | None |

How I checked delivery: `git log admin-demo..fix/bug-NN` for every branch, and `git patch-id` comparing each agent's earlier push with the rebased commit on `fix/review-bugs`. All matched except bug 1, whose rebased commit differs only in context lines. The agents' "Merge earlier push" commits add no content. I re-fetched before committing; nothing new had arrived.

## C. Bugs

The original ten are summarised in B. Reproduction on `admin-demo` and verification on the final branch were run against the same local database (scripts listed in E).

| ID | Sev. | File / function | Reproduction | Root cause | Fix | Verification |
|---|---|---|---|---|---|---|
| 1 | High | `book/BookingForm.tsx`, ServiceForm, VideoForm, login | Bad phone on /book: name and notes cleared (baseline) | React 19 resets uncontrolled fields after a `<form action>` finishes, even when the action returned an error | `keepInput()` submits via `onSubmit` + transition, so no automatic reset | PASS (section B) |
| 2 | High | `lib/upload.ts` `encodeImage` | Safari returns PNG for `toBlob("image/webp")`; the file was still labelled `.webp`, and large ones exceeded 5 MB | Output type never checked | Check `blob.type`, fall back to JPEG, step size/quality down to fit | PASS (simulated Safari) |
| 3 | Med | `ServiceForm.tsx` | Tick "Enquiry only", save: `price_from` NULL (baseline) | Price inputs unmounted, so not posted | Values kept in state and posted as hidden inputs | PASS |
| 4 | Med | `privacy/page.tsx` | Page said there were "no forms that send data to us" | Text predated the booking form | Accurate notice | PASS (claims checked live) |
| 5 | High | `submit_booking()` | Direct RPC had no limits or date check | Checks lived only in the website | `003_booking_limits.sql` (locked, India date, per-phone, global) | PASS incl. concurrency |
| 6 | High | admin actions | Forced write failure: no message (baseline) | Supabase `{error}` ignored | `failIf()` redirects back with `?error=`; `<Notice/>` shows it | PASS |
| 7 | High | `bookings/export/route.ts` | 2,508 bookings → 1,000 exported (baseline) | PostgREST caps each response at 1000 | `fetchAllPages()` with a stable order | PASS |
| 8 | Low | `services/page.tsx` | Bookings off still said "Taking bookings" (baseline) | Label ignored `booking_enabled` | Three-way label | PASS |
| 9 | Med | upload flows | Removed/cancelled uploads stayed public | Uploads hit the bucket before any row refers to them | Owner-only `discardUploads`, safe `removeUnsaved` | PASS |
| 10 | Med | CSV export | Leading tab or whitespace before `=` passed through | Guard only checked the first character | OWASP-style guard in `lib/csv.ts` | PASS |
| **S1** | **High** | `src/proxy.ts` `proxy`; `throw new Error("Not allowed")` in `bookings/`, `services/`, `media/actions.ts` | Open /admin/bookings, let the session expire (cookies cleared), press Save: "This page couldn't load". Network: `307 POST /admin/bookings → POST /admin/login → JSON` | With no session, the proxy redirected the **Server Action POST** with a 307. The browser re-sent the action to `/admin/login`, whose response the client can't interpret. On `admin-demo` too, not caused by an agent. | Proxy lets requests carrying the `next-action` header through; each admin action now `redirect("/admin/login")` instead of throwing. Page GETs are still redirected. Every action still checks the owner before any write, as the Next 16 proxy docs require. | Expired session → lands on `/admin/login`, nothing written. Forged no-session action POST → 400 page with no admin data. Signed-out GETs and CSV still redirect, and a non-admin still gets "No access" and a 403 on the CSV. |
| **S2** | Med | `src/lib/pages.ts` `fetchAllPages` | With the API "Max rows" at 500, the export returned 500 "Export failed", so no backup | Fixed 1000-row windows, and a stop at the first short page | Each request starts after the rows received so far, continuing to the reported `count` | Live: 2,508/2,508 with the cap at 500 and at 1000. Unit: caps 500/1000, no count, error, empty, rows deleted mid-export. |

## D. Integration findings

- **ServiceForm / services actions / media actions / MediaTools (bugs 1, 3, 6, 9):** combined cleanly. Bug 1 rebased onto bug 9's imports correctly. `useActionState` signatures match `saveService(_: string|null, f)` and `addVideo`. `failIf` (bug 6) and `removeUnsaved` (bug 9) are ordered correctly in `addPhotos`: delete first, because `failIf` redirects.
- **Export route (bugs 7, 10):** paging and the `csvCell` guard compose correctly; verified together on 2,508 rows with injection payloads.
- **`MEDIA_PATH` (bugs 2, 9):** `.jpg` is accepted everywhere a path is validated (`saveService`, `addPhotos`, `removeUnsaved`). The bucket's `allowed_mime_types` already includes `image/jpeg`.
- **SQL vs code (bug 5):** `003` keeps the signature and grants that the site calls. Error strings `date_in_past`, `rate_limited_phone`, `rate_limited_global` and `service_unavailable` match `DB_ERRORS` in `book/actions.ts`, and each was seen end to end. The SQL applies cleanly after `setup.sql` and `002_media.sql`.
- **Types/build:** `tsc --noEmit` and `next build` are clean. A fresh clone needs `next build` once (it generates `next-env.d.ts`) before `tsc` can resolve the `.webp` imports; that's the same on `admin-demo`.

## E. Test results

**What ran against what.**
- **App:** `next build` + `next start` (production) from `fix/supervisor` at `50409d2`.
- **Database:** a throwaway local stack in Docker inside this cloud session:
  - `supabase/postgres:15.8.1.085`
  - `supabase/gotrue:v2.177.0` (Auth)
  - `supabase/storage-api:v1.25.7` (file backend)
  - `postgrest/postgrest:v12.2.12` with `max-rows=1000`
  - a small Node gateway standing in for Kong (routing, CORS).
  - `setup.sql`, `002_media.sql` and `003_booking_limits.sql` applied in order.
  - Test users `owner@test.local` (on `admins`) and `stranger@test.local` (signed in, not an admin).
- **Not used:** the owner's real Supabase project. No external accounts were created.
- **Browser:** the pre-installed Playwright Chromium.
- **Baseline:** `admin-demo` built separately on port 3001, against the same local database.

**Passed**

- Static: `tsc --noEmit`, `next build`, `npm run check:csv` (28/28), `fetchAllPages` unit cases (S2).
- Pages at 1920/1366/390 (33 loads): `/`, `/services`, `/gallery`, `/book`, `/privacy`, `/terms`, both service pages, `/admin`, `/admin/services`, `/admin/login`. All 200, no app console errors, no horizontal scroll (390px: `/` and `/pet-walking-hyderabad` have 2px of clipped marquee/SVG; body is `overflow-x: clip`, `scrollX` stays 0).
- Signed out: `/admin*` → 307 `/admin/login`. CSV → 307 login. Non-admin: "No access", CSV 403. Tampered cookie → login.
- Booking (browser, 390px): bad phone, short name, past date, no service and honeypot each show the right error and keep every field. 3 successes give `AK-` codes with the phone stored stripped and a WhatsApp link carrying the code. 4th from the same number (`+91` form) gives the phone limit. Service paused after load gives `service_unavailable`. 30/hour gives the global limit.
- Direct RPC with the anon key: past date, 81-char name, 1001-char notes, bad phone, null name, unknown service are all rejected. Concurrency 20→3 and 40→30.
- RLS (anon and non-admin): select, insert, update and delete on `bookings`, update on `services`, reading drafts, `admins`, `media` insert and Storage upload are all denied or empty. Owner reads all.
- Admin services: the full lifecycle (draft → publish → book → edit → archive with booking history kept → restore → reorder), duplicate address, enquiry-only, and photo upload/remove/cancel on real Storage.
- Gallery: upload 2, caption plus hide (anon sees only published), bad/good video link, delete row plus file.
- Bookings: status and private notes saved.
- Failed writes (forced by a test trigger): five screens show the error; nothing is written.
- Tampering via intercepted Server Action requests: forged photo paths, `../` traversal, external URLs, 500-char alt, malformed packages JSON, bogus status, 5,000-char name, forged `discardUploads` and `addPhotos` arguments. All neutralised.
- Expired session mid-action → login (after S1 fix). CSV past 1,000 rows with injection payloads (after S2, also at cap 500).
- Final regression run: **89/89**.

**Failed:** none on the final build. Before my fixes: S1 (expired session → crash page) and S2 (cap 500 → no export).

**Skipped / could not run**
- Hosted Supabase (real project Auth, Storage, Kong, its rate limits): no keys, and destructive tests there are off-limits.
- Real iPhone/Safari and WebKit: only Chromium is installed. The Safari WebP behaviour was simulated by patching `canvas.toBlob`.
- `next/image` display of Supabase photos on `/services` and `/gallery`: it only allows `https` Supabase hosts, and the local stack is plain `http` on localhost, so the optimiser returns 400 here. Production uses `https://<ref>.supabase.co`. Uploaded photos themselves were served and checked directly.
- YouTube thumbnails (`i.ytimg.com`): blocked by this sandbox's network proxy.
- Pre-hydration (no-JavaScript) form posts.

## F. Remaining issues (not fixed, with reasons)

1. **No per-IP limit on bookings.** The database can't see the visitor's IP. Recommend a Vercel Firewall rate-limit rule on `POST /book`, for example 10/min per IP. This is a hosting setting, not code.
2. **The global breaker can be used to block real customers.** Someone rotating phone numbers can use up 30/hour, and genuine customers are then told to use WhatsApp. This is bug 5's documented trade-off; F1 is the mitigation.
3. **Admin sign-in brute force** relies on Supabase Auth's own limits. Sign-in runs on the server, so Supabase may see the server's IP rather than the attacker's, and a lockout could then hit the owner too. Not testable without the hosted project.
4. **Uploads orphaned when the tab closes, crashes or loses connection** before Save or Cancel. The browser gives no reliable hook for this. Agent 9 documented an upgrade path (upload to `pending/` plus a scheduled sweep).
5. **Not verified on hosted Supabase:** see E.
6. **Not verified on a real iPhone:** worth one manual test, uploading a HEIC/portrait photo from the iPhone admin page.
7. `PhotoPicker` rejects files whose MIME type is empty (some Android file pickers). Rare; the error message tells the owner which file failed.
8. Saving an edit to a service that was deleted in the meantime reports "Saved" (0 rows updated). Services are archived, never deleted, so this can't normally happen.
9. Cosmetic: failed booking attempts use up request numbers, so `AK-` codes have gaps, and the sequential codes reveal rough booking volume.
10. Commit author metadata: this cloud environment's preconfigured git identity is "Claude <noreply@anthropic.com>". 8 of the 10 agent commits on `fix/review-bugs` and my two use it; the other 2 use your own GitHub identity. Every commit message is free of trailers and AI mentions, but the author field isn't. Rewriting it would need the force-push this task forbids, so I left it for you to decide.

## G. Final status

**FUNCTIONALLY STABLE WITH LIMITATIONS**

## H. Files changed by the supervisor, and SQL to run

Commits on `fix/supervisor`, also fast-forwarded onto `fix/review-bugs` without force:

- `9254d67` Send the owner to sign-in when a session expires mid-action. Files:
  - `src/proxy.ts`
  - `src/app/admin/(panel)/bookings/actions.ts`
  - `src/app/admin/(panel)/services/actions.ts`
  - `src/app/admin/(panel)/media/actions.ts`
- `50409d2` Export every booking even when the API caps pages below 1000 rows: `src/lib/pages.ts`
- This report: `SUPERVISOR_ENGINEERING_REPORT.md` (on `fix/supervisor` only)

**SQL the owner must run** (Supabase → SQL Editor), once, after the already-live `setup.sql` and `002_media.sql`:

1. `supabase/003_booking_limits.sql` (from bug 5). It replaces `submit_booking()` with the same signature and adds an index. Run it before or together with deploying this code, so the new date and limit messages have a database behind them. The site works with or without it, but without it the limits don't exist.

My fixes need no schema changes. I did not edit `setup.sql` or `002_media.sql`.

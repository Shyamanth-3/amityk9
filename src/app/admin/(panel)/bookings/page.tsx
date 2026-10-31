import { currentAdmin } from "@/lib/supabase";
import { BOOKING_STATUS, type Booking, type BookingStatus } from "@/lib/services";
import { updateBooking } from "./actions";
import s from "../../admin.module.css";

export const dynamic = "force-dynamic";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function Bookings({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const { db } = (await currentAdmin())!;
  let query = db.from("bookings").select("*").order("created_at", { ascending: false }).limit(200);
  if (status in BOOKING_STATUS) query = query.eq("status", status);
  const term = q.trim().replace(/[%,()*]/g, "").slice(0, 60);
  if (term) query = query.or(`request_code.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%,pet_name.ilike.%${term}%,community.ilike.%${term}%`);
  const { data } = await query;
  const bookings = (data ?? []) as Booking[];

  return (
    <>
      <div className={s.head}>
        <div><h1>Bookings</h1><p>Every request from the website is saved here, even if the customer never sent the WhatsApp message.</p></div>
        <a className={s.ghost} href="/admin/bookings/export">Download all (CSV)</a>
      </div>

      <form className={s.filters}>
        <input name="q" defaultValue={q} placeholder="Search name, phone, request ID…" aria-label="Search bookings" />
        <select name="status" defaultValue={status} aria-label="Filter by status">
          <option value="">All statuses</option>
          {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((k) => <option key={k} value={k}>{BOOKING_STATUS[k]}</option>)}
        </select>
        <button className={s.ghost}>Filter</button>
      </form>

      <table className={s.table}>
        <thead><tr><th>Request</th><th>Customer and pet</th><th>Preferred</th><th>Status and notes</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>
                <b>{b.request_code}</b>
                <div className={s.muted}>{when(b.created_at)}</div>
                <div>{b.service_name}</div>
              </td>
              <td>
                <b>{b.customer_name}</b> · <a href={`tel:${b.phone}`}>{b.phone}</a>
                <div className={s.muted}>{[b.pet_name, b.pet_type].filter(Boolean).join(", ")}{b.community ? ` · ${b.community}` : ""}</div>
                {b.notes && <div className={s.muted}>“{b.notes}”</div>}
              </td>
              <td className={s.muted}>{b.preferred_date ?? "Any date"}{b.preferred_time ? <><br />{b.preferred_time}</> : null}</td>
              <td>
                <form action={updateBooking.bind(null, b.id)} className={s.form} style={{ gap: 8 }}>
                  <span className={`${s.badge} ${s[`b-${b.status}`]}`}>{BOOKING_STATUS[b.status]}</span>
                  <select name="status" defaultValue={b.status} className={s.ghost} aria-label={`Status for ${b.request_code}`}>
                    {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((k) => <option key={k} value={k}>{BOOKING_STATUS[k]}</option>)}
                  </select>
                  <label className={s.field}><textarea name="internal_notes" defaultValue={b.internal_notes} placeholder="Private notes (only you see these)" style={{ minHeight: 60 }} /></label>
                  <button className={s.ghost}>Save</button>
                </form>
              </td>
            </tr>
          ))}
          {!bookings.length && <tr><td colSpan={4} className={s.muted}>{q || status ? "No bookings match." : "No bookings yet. Requests from /book will appear here."}</td></tr>}
        </tbody>
      </table>
    </>
  );
}

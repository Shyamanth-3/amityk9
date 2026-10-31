import { currentAdmin } from "@/lib/supabase";
import { SERVICE_STATUS, priceLabel, type Service } from "@/lib/services";
import { move, setStatus } from "./actions";
import s from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function Services({ searchParams }: { searchParams: Promise<{ saved?: string; archived?: string }> }) {
  const { saved, archived } = await searchParams;
  const { db } = (await currentAdmin())!;
  let q = db.from("services").select("*").order("display_order");
  if (!archived) q = q.neq("status", "archived");
  const { data } = await q;
  const services = (data ?? []) as Service[];

  return (
    <>
      <div className={s.head}>
        <div>
          <h1>Services</h1>
          <p>Only <b>Published</b> services appear on the website. New services start as drafts.</p>
        </div>
        <a className={s.primary} href="/admin/services/new">+ Add a service</a>
      </div>
      {saved && <p className={s.ok} style={{ marginBottom: 18 }}>Saved “{saved}”.</p>}

      <table className={s.table}>
        <thead><tr><th>Order</th><th>Service</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>
          {services.map((v, i) => (
            <tr key={v.id}>
              <td>
                {v.status !== "archived" && (
                  <div className={s.actions}>
                    <form action={move.bind(null, v.id, -1)}><button className={s.ghost} disabled={i === 0} aria-label={`Move ${v.name} up`}>↑</button></form>
                    <form action={move.bind(null, v.id, 1)}><button className={s.ghost} aria-label={`Move ${v.name} down`}>↓</button></form>
                  </div>
                )}
              </td>
              <td className={s.svcCell}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {v.images?.[0] ? <img src={v.images[0].url} alt="" className={s.mini} /> : <span className={s.mini} />}
                <div>
                <a href={`/admin/services/${v.id}`}><b>{v.name}</b></a>
                <div className={s.muted}>/services#{v.slug}{v.temporarily_unavailable ? " · temporarily unavailable" : ""}{v.booking_enabled ? "" : " · bookings off"}</div>
                </div>
              </td>
              <td><span className={`${s.badge} ${s[`b-${v.status}`]}`}>{SERVICE_STATUS[v.status]}</span></td>
              <td className={s.muted}>{priceLabel(v)}</td>
              <td>
                <div className={s.actions}>
                  <a className={s.ghost} href={`/admin/services/${v.id}`}>Edit</a>
                  {v.status !== "published" && v.status !== "archived" && <form action={setStatus.bind(null, v.id, "published")}><button className={s.ghost}>Publish</button></form>}
                  {v.status === "published" && <form action={setStatus.bind(null, v.id, "unpublished")}><button className={s.ghost}>Unpublish</button></form>}
                  {v.status !== "archived"
                    ? <form action={setStatus.bind(null, v.id, "archived")}><button className={`${s.ghost} ${s.danger}`}>Archive</button></form>
                    : <form action={setStatus.bind(null, v.id, "draft")}><button className={s.ghost}>Restore as draft</button></form>}
                </div>
              </td>
            </tr>
          ))}
          {!services.length && <tr><td colSpan={5} className={s.muted}>No services yet.</td></tr>}
        </tbody>
      </table>
      <p className={s.muted} style={{ marginTop: 14 }}>
        {archived ? <a href="/admin/services">Hide archived services</a> : <a href="/admin/services?archived=1">Show archived services</a>}
        {" "}· Archived services are hidden from the website but their booking history is kept.
      </p>
    </>
  );
}

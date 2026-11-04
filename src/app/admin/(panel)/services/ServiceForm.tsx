"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { SERVICE_STATUS, slugify, type Package, type Photo, type Service, type ServiceStatus } from "@/lib/services";
import { keepInput } from "@/lib/keepInput";
import PhotoPicker from "../../PhotoPicker";
import { saveService } from "./actions";
import { discardUploads } from "../../uploads";
import s from "../../admin.module.css";

const blank: Package = { name: "", price: null, visits: null, note: "" };

export default function ServiceForm({ service }: { service?: Service }) {
  const [error, action, pending] = useActionState(saveService, null);
  const [name, setName] = useState(service?.name ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [enquiryOnly, setEnquiryOnly] = useState(service?.enquiry_only ?? false);
  // Kept in state so ticking "Enquiry only" (which hides the inputs) never loses them.
  const [priceFrom, setPriceFrom] = useState(service?.price_from != null ? String(service.price_from) : "");
  const [duration, setDuration] = useState(service?.duration ?? "");
  const [pkgs, setPkgs] = useState<Package[]>(service?.packages?.length ? service.packages : []);
  const [photos, setPhotos] = useState<Photo[]>(service?.images ?? []);
  const [leaving, setLeaving] = useState(false);
  // Photos uploaded in this visit and not yet saved. Photos already on the service are never deleted from
  // here: saveService removes those only after the save succeeds, so Cancel can't destroy live photos.
  const fresh = useRef(new Set<string>());
  const discard = (paths: string[]) => {
    paths.forEach((p) => fresh.current.delete(p));
    return paths.length ? discardUploads(paths).catch(() => {}) : Promise.resolve();
  };
  // Leaving through the admin menu unmounts the form; so does the redirect after a good save, which is safe
  // because the server keeps any photo a saved row uses.
  useEffect(() => () => { if (fresh.current.size) discardUploads([...fresh.current]).catch(() => {}); }, []);

  const setPkg = (i: number, k: keyof Package, v: string) =>
    setPkgs(pkgs.map((p, j) => (j === i ? { ...p, [k]: k === "price" || k === "visits" ? (v === "" ? null : Number(v)) : v } : p)));

  return (
    <form action={action} onSubmit={keepInput(action)} className={s.form}>
      <input type="hidden" name="id" value={service?.id ?? ""} />
      <input type="hidden" name="packages" value={JSON.stringify(pkgs)} />
      <input type="hidden" name="images" value={JSON.stringify(photos)} />

      <section className={s.section}>
        <h2>About the service</h2>
        <div className={s.row}>
          <label className={s.field}><span>Service name</span>
            <input name="name" required maxLength={80} value={name} placeholder="e.g. Pet grooming"
              onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
          </label>
          <label className={s.field}><span>Web address</span>
            <input name="slug" maxLength={60} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} />
            <small>amityk9.vercel.app/services#{slug || "…"}</small>
          </label>
        </div>
        <label className={s.field}><span>Short summary</span><input name="summary" maxLength={300} defaultValue={service?.summary} placeholder="One line shown on the services page" /></label>
        <label className={s.field}><span>Description</span><textarea name="description" maxLength={4000} defaultValue={service?.description} /></label>
        <label className={s.field}><span>What&apos;s included</span>
          <textarea name="inclusions" defaultValue={service?.inclusions?.join("\n")} placeholder={"One item per line\ne.g. Bath and blow-dry"} />
        </label>
      </section>

      <section className={s.section}>
        <h2>Photos</h2>
        <p className={s.muted}>The first photo is the cover on the services page. Photos are resized automatically; up to 6.</p>
        {photos.length > 0 && (
          <div className={s.thumbs}>
            {photos.map((p, i) => (
              <figure key={p.path} className={s.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" />
                {i === 0 && <span className={s.cover}>Cover</span>}
                <input value={p.alt} maxLength={120} placeholder="Describe the photo" aria-label="Photo description"
                  onChange={(e) => setPhotos(photos.map((q, j) => (j === i ? { ...q, alt: e.target.value } : q)))} />
                <div className={s.actions}>
                  {i > 0 && <button type="button" className={s.ghost} onClick={() => setPhotos([p, ...photos.filter((_, j) => j !== i)])}>Make cover</button>}
                  <button type="button" className={`${s.ghost} ${s.danger}`} onClick={() => { setPhotos(photos.filter((_, j) => j !== i)); if (fresh.current.has(p.path)) discard([p.path]); }}>Remove</button>
                </div>
              </figure>
            ))}
          </div>
        )}
        {photos.length < 6 && (
          <PhotoPicker folder="services" onUploaded={(list) => {
            const all = [...photos, ...list.map((u) => ({ ...u, alt: "" }))];
            all.slice(photos.length, 6).forEach((p) => fresh.current.add(p.path));
            discard(all.slice(6).map((p) => p.path)); // over the limit of 6
            setPhotos(all.slice(0, 6));
          }} />
        )}
      </section>

      <section className={s.section}>
        <h2>Price and packages</h2>
        <label className={s.check}><input type="checkbox" name="enquiry_only" checked={enquiryOnly} onChange={(e) => setEnquiryOnly(e.target.checked)} />Enquiry only: show “Contact for pricing” instead of a price</label>
        {enquiryOnly ? (
          <>
            <input type="hidden" name="price_from" value={priceFrom} />
            <input type="hidden" name="duration" value={duration} />
          </>
        ) : (
          <div className={s.row}>
            <label className={s.field}><span>Starting price (₹ a month)</span>
              <input name="price_from" type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
            </label>
            <label className={s.field}><span>Duration</span>
              <input name="duration" maxLength={80} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. About 30 min per walk" />
            </label>
          </div>
        )}
        {pkgs.map((p, i) => (
          <div key={i} className={s.pkg}>
            <label className={s.field}><span>Package</span><input value={p.name} onChange={(e) => setPkg(i, "name", e.target.value)} placeholder="Gold" /></label>
            <label className={s.field}><span>Price ₹</span><input type="number" min={0} value={p.price ?? ""} onChange={(e) => setPkg(i, "price", e.target.value)} /></label>
            <label className={s.field}><span>Visits</span><input type="number" min={0} value={p.visits ?? ""} onChange={(e) => setPkg(i, "visits", e.target.value)} /></label>
            <label className={s.field}><span>Note</span><input value={p.note} onChange={(e) => setPkg(i, "note", e.target.value)} placeholder="6 days a week" /></label>
            <button type="button" className={`${s.ghost} ${s.danger}`} onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        {pkgs.length < 8 && <div><button type="button" className={s.ghost} onClick={() => setPkgs([...pkgs, { ...blank }])}>+ Add a package</button></div>}
      </section>

      <section className={s.section}>
        <h2>Availability and bookings</h2>
        <div className={s.row}>
          <label className={s.field}><span>Service area</span><input name="service_area" maxLength={200} defaultValue={service?.service_area ?? "Gated communities in Hyderabad"} /></label>
          <label className={s.field}><span>Days and times</span><input name="availability" maxLength={200} defaultValue={service?.availability ?? "Monday to Saturday"} /></label>
        </div>
        <label className={s.check}><input type="checkbox" name="booking_enabled" defaultChecked={service?.booking_enabled ?? true} />Customers can request this service in the booking form</label>
        <label className={s.check}><input type="checkbox" name="temporarily_unavailable" defaultChecked={service?.temporarily_unavailable} />Temporarily unavailable (still shown, but can&apos;t be booked)</label>
      </section>

      <section className={s.section}>
        <h2>Visibility</h2>
        <label className={s.field}><span>Status</span>
          <select name="status" defaultValue={service?.status ?? "draft"}>
            {(Object.keys(SERVICE_STATUS) as ServiceStatus[]).map((k) => <option key={k} value={k}>{SERVICE_STATUS[k]}</option>)}
          </select>
          <small>Draft and Unpublished services are hidden from the website. Archived services are hidden and kept for booking history.</small>
        </label>
      </section>

      {error && <p className={s.error} role="alert">{error}</p>}
      <div className={s.bar}>
        <button className={s.primary} disabled={pending}>{pending ? "Saving…" : "Save service"}</button>
        <a className={s.ghost} href="/admin/services" aria-disabled={leaving}
          onClick={async (e) => { e.preventDefault(); if (leaving) return; setLeaving(true); await discard([...fresh.current]); window.location.assign("/admin/services"); }}>
          {leaving ? "Cancelling…" : "Cancel"}</a>
      </div>
    </form>
  );
}

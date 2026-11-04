"use client";
import { useActionState, useState } from "react";
import { wa } from "@/lib/site";
import { keepInput } from "@/lib/keepInput";
import { Icon } from "@/components/Icons";
import { submitBooking } from "./actions";
import s from "../public.module.css";

type Opt = { id: string; slug: string; name: string };

export default function BookingForm({ services, initial }: { services: Opt[]; initial: string }) {
  const [state, action, pending] = useActionState(submitBooking, null);
  const [service, setService] = useState(initial);

  if (state?.code) return (
    <div className={s.done} role="status">
      <p className={s.doneTag}>Request received — awaiting confirmation</p>
      <h2>Your request ID is <span>{state.code}</span></h2>
      <p>We&apos;ve saved your {state.service?.toLowerCase()} request. Sending it doesn&apos;t confirm a slot yet; we&apos;ll get back to you to confirm availability.</p>
      <p>Want a faster reply? Send us the details on WhatsApp too:</p>
      <a className="btn btn-primary" href={wa(state.summary)} target="_blank" rel="noopener"><Icon id="chat" />Send on WhatsApp</a>
    </div>
  );

  if (!services.length) return <p className={s.lede}>Bookings are paused right now. Please message us on WhatsApp.</p>;

  return (
    <form action={action} onSubmit={keepInput(action)} className={s.form} noValidate>
      {/* hidden from people; bots that fill it are ignored */}
      <input name="website" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden="true" />
      <input type="hidden" name="service_name" value={services.find((v) => v.id === service)?.name ?? ""} />

      <label className={s.field}><span>Service</span>
        <select name="service" required value={service} onChange={(e) => setService(e.target.value)}>
          <option value="" disabled>Choose a service</option>
          {services.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </label>
      <div className={s.two}>
        <label className={s.field}><span>Your name</span><input name="name" required maxLength={80} autoComplete="name" /></label>
        <label className={s.field}><span>Mobile number</span><input name="phone" required inputMode="tel" maxLength={16} autoComplete="tel" placeholder="98765 43210" /></label>
      </div>
      <div className={s.two}>
        <label className={s.field}><span>Pet&apos;s name</span><input name="pet_name" maxLength={60} /></label>
        <label className={s.field}><span>Pet</span>
          <select name="pet_type" defaultValue="Dog"><option>Dog</option><option>Cat</option><option>Other</option></select>
        </label>
      </div>
      <label className={s.field}><span>Community and block</span><input name="community" maxLength={120} placeholder="e.g. My Home Avatar, Block C" /></label>
      <div className={s.two}>
        <label className={s.field}><span>Preferred start date</span><input name="date" type="date" /></label>
        <label className={s.field}><span>Preferred time</span>
          <select name="time" defaultValue=""><option value="">Any time</option><option>Early morning (6–8 am)</option><option>Morning (8–11 am)</option><option>Afternoon</option><option>Evening (5–8 pm)</option></select>
        </label>
      </div>
      <label className={s.field}><span>Anything we should know?</span><textarea name="notes" maxLength={1000} placeholder="Temperament, medicines, keys, etc." /></label>

      {state?.error && <p className={s.error} role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send request"}</button>
      <p className={s.fine}>We only use these details to arrange care for your pet. See our <a href="/privacy">privacy notice</a>.</p>
    </form>
  );
}

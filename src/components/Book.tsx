"use client";
import { useState } from "react";
import { PLANS, MODE_COPY, PHONE, PHONE_DISPLAY, wa, type Mode } from "@/lib/site";
import { Icon } from "./Icons";
import s from "./Book.module.css";

type Pet = "dog" | "cat";

// WhatsApp composer: builds a wa.me link from the fields. Nothing is sent or stored by the site.
export default function Book({ initial = "walk" }: { initial?: Mode }) {
  const [name, setName] = useState("");
  const [pet, setPet] = useState<Pet>(initial === "sit" ? "cat" : "dog");
  const [community, setCommunity] = useState("");
  const [mode, setMode] = useState<Mode>(initial);
  const [plan, setPlan] = useState("");

  const who = name.trim() || `my ${pet}`;
  const msg = [
    `Hi AmityK9! I'd like ${MODE_COPY[mode].label.toLowerCase()} for ${who}${name.trim() ? ` (a ${pet})` : ""}.`,
    community.trim() && `We live in ${community.trim()}.`,
    plan ? `I'm looking at the ${plan} plan.` : "Could you help me pick a plan?",
    "When could we do a meet-and-greet?",
  ].filter(Boolean).join(" ");

  return (
    <section className={s.book} id="book">
      <span className={s.tagdisc} data-leash-end aria-hidden="true"><svg><use href="#paw" /></svg></span>
      <div className={`wrap ${s.grid}`}>
        <div data-rv>
          <h2 className={s.h2}>Let&apos;s keep them happy, healthy <em>and loved.</em></h2>
          <p className={s.lead}>Tell us your pet&apos;s name, your community and the plan you like. We&apos;ll set up a quick meet-and-greet before the first walk.</p>

          <form className={s.form} onSubmit={(e) => { e.preventDefault(); window.open(wa(msg), "_blank", "noopener"); }}>
            <label className={s.field}><span>Pet&apos;s name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bruno" maxLength={40} autoComplete="off" />
            </label>
            <label className={s.field}><span>Community</span>
              <input value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. My Home Avatar, Block C" maxLength={60} autoComplete="off" />
            </label>
            <fieldset className={s.chips}><legend>Who&apos;s joining?</legend>
              {(["dog", "cat"] as const).map((p) => (
                <label key={p}><input type="radio" name="pet" checked={pet === p} onChange={() => setPet(p)} /><span>{p === "dog" ? "A dog" : "A cat"}</span></label>
              ))}
            </fieldset>
            <fieldset className={s.chips}><legend>Service</legend>
              {(["walk", "sit"] as const).map((m) => (
                <label key={m}><input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} /><span>{MODE_COPY[m].label}</span></label>
              ))}
            </fieldset>
            <fieldset className={`${s.chips} ${s.wide}`}><legend>Plan</legend>
              {PLANS.map((p) => (
                <label key={p.id}><input type="radio" name="plan" checked={plan === p.name} onChange={() => setPlan(p.name)} /><span><i style={{ background: p.dot }} />{p.name}</span></label>
              ))}
              <label><input type="radio" name="plan" checked={plan === ""} onChange={() => setPlan("")} /><span>Not sure yet</span></label>
            </fieldset>
          </form>
        </div>

        <div className={s.contact} data-rv>
          <span className={s.lbl}>Your message</span>
          <p className={s.bubble} aria-live="polite">{msg}</p>
          <div className={s.btns}>
            <a className={`btn ${s.wa}`} href={wa(msg)} target="_blank" rel="noopener"><Icon id="chat" />Send on WhatsApp</a>
            <a className={`btn ${s.call}`} href={`tel:${PHONE}`}>Call {PHONE_DISPLAY}</a>
          </div>
          <small>Monday to Saturday · We usually reply within the hour</small>
        </div>
      </div>
    </section>
  );
}

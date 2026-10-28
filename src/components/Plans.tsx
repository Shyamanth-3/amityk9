"use client";
import { useState } from "react";
import { PLANS, MODE_COPY, daysAWeek, inr, wa, type Mode } from "@/lib/site";
import { Icon } from "./Icons";
import s from "./Plans.module.css";
import { Charminar } from "./Doodles";
import d from "./Doodles.module.css";

export default function Plans({ initial = "walk", num = "03" }: { initial?: Mode; num?: string }) {
  const [mode, setMode] = useState<Mode>(initial);
  const copy = MODE_COPY[mode];

  return (
    <section className={s.plans} id="plans">
      <div className="wrap">
        <div className={s.head} data-rv>
          <div><p className="eyebrow"><span className="num">{num}</span><span className="rule" />Membership plans</p><h2>Pick a rhythm that <em>suits your pet.</em></h2></div>
          <div className={s.toggle} data-mode={mode} role="group" aria-label="Service type">
            <span className={s.pill} aria-hidden="true" />
            {(["walk", "sit"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{MODE_COPY[m].label}</button>
            ))}
          </div>
        </div>
        <div className={s.tiers} data-rvg>
          {PLANS.map((p) => (
            <article key={p.id} className={`${s.tier} ${"popular" in p ? s.gold : ""}`}>
              {"popular" in p && <span className={s.flag}>Most popular</span>}
              <div className={s.nm}><h3>{p.name}</h3><span className={s.dot} style={{ background: p.dot }} /></div>
              <p className={s.sub}>{p.sub}</p>
              <p className={s.price}><sup>₹</sup>{p.price.toLocaleString("en-IN")}<span> / month</span></p>
              <p className={s.rhythm} key={`r${mode}`}>{daysAWeek(p.visits[mode])} days a week · Mon – Sat</p>
              <div className={s.count}>
                <span className={s.n} key={`n${mode}`}>{p.visits[mode]}</span>
                <span className={s.l} key={mode} aria-live="polite">{copy.unit}<br /><span>{copy.dur}</span></span>
              </div>
              <ul>{p.perks.map((k) => <li key={k}><Icon id="tick" />{k}</li>)}</ul>
              <a className={s.cta} href={wa(`Hi AmityK9, I'd like the ${p.name} plan (${inr(p.price)}/month) for ${copy.label.toLowerCase()}.`)}>
                {"popular" in p && <Icon id="chat" />}Choose {p.name}
              </a>
            </article>
          ))}
        </div>
        <p className={s.fine}><span>Each plan covers one pet</span><span>Additional pets may be charged extra</span><span>Unused visits expire at month end</span></p>
      </div>
      <Charminar className={d.plansCharminar} />
    </section>
  );
}

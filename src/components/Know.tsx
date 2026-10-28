"use client";
import { useState } from "react";
import s from "./Know.module.css";
import { CatCurl } from "./Doodles";
import d from "./Doodles.module.css";

const DAYS = [
  ["M", "Mon", "Monday: walks and visits as planned. Fresh week, fresh sniffs."],
  ["T", "Tue", "Tuesday: same walker, same time, same happy tail."],
  ["W", "Wed", "Wednesday: midweek walks, photo updates as usual."],
  ["T", "Thu", "Thursday: walks and visits as planned."],
  ["F", "Fri", "Friday: we're out on the paths. Book extra hours for the weekend."],
  ["S", "Sat", "Saturday: last walks of the week, then the leash goes on the hook."],
  ["S", "Rest", "Our team takes Sundays off. Even walkers need a walk-free day."],
];

const FACTS = [
  ["Extra sitting", "Need care outside your plan? Book additional hours on normal days. Longer timings on request.", <>₹599 <small>/ 4 hrs</small></>],
  ["Festival season", "Prices for walking and sitting may change during festivals, when demand is high.", "Heads-up"],
  ["Refunds", "Not happy? Ask for a refund within 2 days of payment. After the 3rd day, payments can't be refunded.", "2 days"],
  ["Where we work", "Services are available only within the gated communities we serve, subject to availability and pet behaviour.", "On-site"],
] as const;

export default function Know() {
  const [day, setDay] = useState(6);
  return (
    <section className={s.know} id="know">
      <div className={`wrap ${s.grid}`}>
        <div data-rv>
          <p className="eyebrow"><span className="num">04</span><span className="rule" />Good to know</p>
          <h2 className={s.h2}>A few things <em>before you book.</em></h2>
          <div className={s.week} onMouseLeave={() => setDay(6)}>
            <div className={s.row}>
              {DAYS.map(([d, lbl], i) => (
                <button key={i} type="button" className={`${s.d} ${i === 6 ? s.off : ""} ${i === day ? s.on : ""}`}
                  onMouseEnter={() => setDay(i)} onFocus={() => setDay(i)} onClick={() => setDay(i)} aria-label={lbl === "Rest" ? "Sunday" : lbl}>
                  <span>{d}</span><small>{lbl}</small>
                </button>
              ))}
            </div>
            <p aria-live="polite"><span className={s.z}>{day === 6 ? "zzz" : "woof"}</span><span key={day} className={s.msg}>{DAYS[day][2]}</span></p>
          </div>
        </div>
        <dl className={s.facts} data-rv>
          {FACTS.map(([h, p, v]) => (
            <div key={h} className={s.fact}>
              <dt>{h}</dt>
              <dd>{p}</dd>
              <dd className={s.v}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <CatCurl className={d.knowCat} />
    </section>
  );
}

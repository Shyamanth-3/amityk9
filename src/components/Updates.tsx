import Image from "next/image";
import beagle from "@/assets/walking-beagle.webp";
import s from "./Updates.module.css";
import { Sprig } from "./Doodles";
import d from "./Doodles.module.css";

const STEPS = [
  ["7:02", "Picked up", "A quick message the moment we're at your door."],
  ["7:16", "Mid-walk photo", "Proof of sniffing, stick-finding and general happiness."],
  ["7:33", "Home again", "Duration, water, anything we noticed. Then the leash goes back on the hook."],
];

export default function Updates() {
  return (
    <section className={s.updates} id="updates">
      <div className={`wrap ${s.grid}`}>
        <div data-rv>
          <p className="eyebrow"><span className="num">02</span><span className="rule" />Walk updates</p>
          <h2 className={s.h2}>You&apos;ll know how the walk went <em>before your coffee&apos;s cold.</em></h2>
          <p className={s.intro}>No apps to install. Updates come straight to your WhatsApp, from the person who actually walked your dog.</p>
          <ol className={s.steps}>
            {STEPS.map(([t, b, d]) => (
              <li key={t}><span className={s.t}>{t}</span><div><b>{b}</b><span>{d}</span></div></li>
            ))}
          </ol>
        </div>

        <div className={s.phoneWrap}>
          <div className={s.phone} data-phone role="img" aria-label="WhatsApp chat: the walker sends a pickup message, a mid-walk photo of Coco the beagle, and a home-again summary">
            <div className={s.screen} aria-hidden="true">
              <div className={s.island} />
              <div className={s.sb}><span>7:35</span><i><span style={{ height: 6 }} /><span style={{ height: 8 }} /><span style={{ height: 10 }} /><span className={s.batt} /></i></div>
              <div className={s.chatH}>
                <div className={s.av}><svg><use href="#paw" /></svg></div>
                <div><b>AmityK9 Walks</b><span>Kiran · your walker</span></div>
              </div>
              <div className={s.msgs}>
                <span className={s.day}>Today</span>
                <div className={`${s.bub} ${s.in}`} data-m>Good morning! Picked up Coco from C-1204. Off to the park side <span className={s.tm}>7:02</span></div>
                <div className={`${s.bub} ${s.in} ${s.photo}`} data-m>
                  <Image src={beagle} alt="" sizes="210px" />
                  <p>Halfway round. Nose has not left the grass once <span className={s.tm}>7:16</span></p>
                </div>
                <div className={s.typing} data-m data-typing><i /><i /><i /></div>
                <div className={`${s.bub} ${s.in}`} data-m data-done>Home now. 31 min walk, drank water, very happy girl <span className={s.tm}>7:33</span></div>
                <div className={`${s.bub} ${s.out}`} data-m data-out>Thank you Kiran! Best part of my morning <span className={s.tm}>7:35<svg viewBox="0 0 16 10"><path d="M1 5.5 3.8 8 9 2M6.5 8 12 2" fill="none" stroke="#3B9BD6" strokeWidth="1.5" strokeLinecap="round" /></svg></span></div>
              </div>
              <div className={s.compose}><div>Message</div><span><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" stroke="#F6F0E4" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg></span></div>
            </div>
          </div>
        </div>
      </div>
      <Sprig className={d.updatesSprig} />
    </section>
  );
}

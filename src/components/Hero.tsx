import Image from "next/image";
import heroImg from "@/assets/hero-walk.webp";
import catImg from "@/assets/sitting-cat.webp";
import { wa } from "@/lib/site";
import { Icon } from "./Icons";
import HeroMotion from "./HeroMotion";
import s from "./Hero.module.css";

// stagger index for the CSS intro (see [data-intro] in globals.css)
const d = (i: number) => ({ "--d": i }) as React.CSSProperties;

export default function Hero() {
  return (
    <section className={s.hero} id="top">
      <div className={`wrap ${s.grid}`}>
        <div className={s.copy}>
          <p className={`eyebrow ${s.eyebrow}`} data-intro style={d(0)}><span className={s.pin} />Pet walking &amp; sitting · Gated communities, Hyderabad</p>
          <h1 className={s.h1}>
            <span className={s.line}><span data-line>Your dog&apos;s</span></span>
            <span className={s.line}><span data-line>favourite</span></span>
            <span className={s.line}><span data-line><em>neighbour.</em></span></span>
          </h1>
          <p className={s.lede} data-intro style={d(1)}>
            Unhurried walks and home visits for dogs and cats, by a team your neighbours already trust. Monday to Saturday, with an update after every visit.
          </p>
          <div className={s.ctas} data-intro style={d(2)}>
            <a className="btn btn-primary" href={wa("Hi AmityK9, I'd like to book a walk.")}><Icon id="chat" />Book on WhatsApp</a>
            <a className={s.ghost} href="#plans"><span className="link-u">See plans &amp; prices</span><span aria-hidden="true">→</span></a>
          </div>
          <dl className={s.meta} data-intro style={d(3)}>
            <div><dt>Mon – Sat</dt><dd>Sundays, we rest</dd></div>
            <div><dt>From ₹2,499</dt><dd>a month, one pet</dd></div>
            <div><dt>Every visit</dt><dd>ends with a photo</dd></div>
          </dl>
        </div>

        <div className={s.stage}>
          <figure className={`${s.polaroid} ${s.main}`} data-par="-50">
            <span className={s.tape} aria-hidden="true" />
            <Image src={heroImg} alt="AmityK9 walker strolling with a happy golden retriever along a leafy gated-community path in Hyderabad"
              priority fetchPriority="high" placeholder="blur" sizes="(max-width: 900px) 92vw, 620px" className={s.mainImg} />
            <figcaption>Bruno · Block C · 7:02 am</figcaption>
          </figure>
          <figure className={`${s.polaroid} ${s.cat}`} data-par="40" data-intro style={d(4)}>
            <span className={s.tape} aria-hidden="true" style={{ transform: "rotate(4deg)" }} />
            <Image src={catImg} alt="Tabby cat relaxing on a sofa during an AmityK9 home visit" placeholder="blur" sizes="(max-width: 900px) 42vw, 240px" className={s.catImg} />
            <figcaption>Mochi, fed &amp; fussed</figcaption>
          </figure>
          <div className={s.badge} data-intro style={d(5)} aria-hidden="true">
            <svg className={s.ring} viewBox="0 0 132 132"><defs><path id="circ" d="M66 66 m-52 0 a52 52 0 1 1 104 0 a52 52 0 1 1 -104 0" /></defs><circle cx="66" cy="66" r="65" fill="#F6F0E4" stroke="#E2D7C4" /><text style={{ fontFamily: "var(--sans)" }} fontSize="11.5" fontWeight="700" textLength="322" lengthAdjust="spacing" fill="#1E4A38"><textPath href="#circ">GATED COMMUNITIES ONLY · HYDERABAD ·</textPath></text></svg>
            <span className={s.core}><Icon id="paw" /></span>
          </div>
          <p className={s.note} data-intro style={d(6)}>
            <svg viewBox="0 0 62 52" aria-hidden="true"><path d="M58 46C40 44 22 34 12 10" fill="none" stroke="#1E4A38" strokeWidth="2" strokeLinecap="round" /><path d="M6 18 11 8 21 13" fill="none" stroke="#1E4A38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            same walker,<br />every week
          </p>
        </div>
      </div>
      <div className={s.trail} data-trail aria-hidden="true" />
      <HeroMotion />
    </section>
  );
}

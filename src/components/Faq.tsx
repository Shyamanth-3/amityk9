import { FAQ, wa } from "@/lib/site";
import s from "./Faq.module.css";
import { PawTrail } from "./Doodles";
import d from "./Doodles.module.css";

// Native <details>: works and is crawlable without JS. PageMotion layers a height animation on top.
export default function Faq({ items = FAQ, num = "05" }: { items?: readonly (readonly [string, string])[]; num?: string }) {
  return (
    <section className={s.faq} id="faq">
      <div className={`wrap ${s.grid}`}>
        <div className={s.aside} data-rv>
          <p className="eyebrow"><span className="num">{num}</span><span className="rule" />Questions</p>
          <h2>Things neighbours <em>usually ask.</em></h2>
          <p>Something else on your mind? <a className="link-u" href={wa()}>Message us on WhatsApp</a> and we&apos;ll reply the same day.</p>
        </div>
        <div className={s.qa} data-rv>
          {items.map(([q, a], i) => (
            <details key={q} className={s.q} open={i === 0} data-faq>
              <summary><span>{q}</span><span className={s.pm} aria-hidden="true" /></summary>
              <div className={s.a}><p>{a}</p></div>
            </details>
          ))}
        </div>
      </div>
      <PawTrail className={d.faqTrail} />
    </section>
  );
}

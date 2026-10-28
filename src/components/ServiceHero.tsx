import Image, { type StaticImageData } from "next/image";
import { wa } from "@/lib/site";
import { Icon } from "./Icons";
import s from "./ServiceHero.module.css";

type Props = {
  crumb: string; title: React.ReactNode; lede: string; image: StaticImageData; alt: string; caption: string;
  facts: [string, string][]; included: string[]; booking: string;
};

// Top of a service page: breadcrumb, h1, key numbers, the photo and what's included.
export default function ServiceHero({ crumb, title, lede, image, alt, caption, facts, included, booking }: Props) {
  return (
    <>
      <section className={s.hero}>
        <div className={`wrap ${s.grid}`}>
          <div>
            <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">{crumb}</span></nav>
            <h1 className={s.h1}>{title}</h1>
            <p className={s.lede}>{lede}</p>
            <div className={s.ctas}>
              <a className="btn btn-primary" href={wa(booking)}><Icon id="chat" />Book on WhatsApp</a>
              <a className={s.ghost} href="#plans"><span className="link-u">See plans &amp; prices</span><span aria-hidden="true">→</span></a>
            </div>
            <dl className={s.facts}>
              {facts.map(([dt, dd]) => <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>)}
            </dl>
          </div>
          <figure className={s.polaroid}>
            <span className={s.tape} aria-hidden="true" />
            <Image src={image} alt={alt} priority fetchPriority="high" placeholder="blur" sizes="(max-width: 900px) 92vw, 560px" />
            <figcaption>{caption}</figcaption>
          </figure>
        </div>
      </section>
      <section className={s.included} aria-labelledby="included">
        <div className="wrap">
          <h2 id="included" className={s.h2}>What&apos;s <em>included</em></h2>
          <ul>{included.map((i) => <li key={i}><Icon id="tick" />{i}</li>)}</ul>
        </div>
      </section>
    </>
  );
}

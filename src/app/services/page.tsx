import type { Metadata } from "next";
import Image from "next/image";
import { publicDb } from "@/lib/supabase";
import { OG, wa } from "@/lib/site";
import { priceLabel, type Service } from "@/lib/services";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Icon } from "@/components/Icons";
import s from "./services.module.css";

// Read live from the database, so services the owner publishes appear without a redeploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Pet care services from AmityK9 in Hyderabad's gated communities: prices, packages and how to book.",
  alternates: { canonical: "/services" },
  openGraph: { ...OG, url: "/services" },
};

export default async function ServicesPage() {
  const { data } = await publicDb().from("services").select("*").eq("status", "published").order("display_order");
  const services = (data ?? []) as Service[];

  return (
    <>
      <Nav />
      <main>
        <header className={`wrap ${s.head}`}>
          <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
          <p className="eyebrow"><span className="num">{String(services.length).padStart(2, "0")}</span><span className="rule" />What we offer</p>
          <h1 className={s.h1}>Care that fits <em>your week.</em></h1>
          <p className={s.lede}>Everything we offer right now, inside your gated community, Monday to Saturday. Pick what suits your pet and send us a request; we&apos;ll confirm the slot with you.</p>
          {services.length > 1 && (
            <ul className={s.jump}>
              {services.map((v) => <li key={v.id}><a href={`#${v.slug}`}>{v.name}</a></li>)}
            </ul>
          )}
        </header>

        {services.map((v, i) => {
          const bookable = v.booking_enabled && !v.temporarily_unavailable;
          const [cover, ...more] = v.images ?? [];
          return (
            <section key={v.id} id={v.slug} className={`${s.svc} ${i % 2 ? s.flip : ""}`} aria-labelledby={`h-${v.slug}`}>
              <div className={`wrap ${s.grid}`}>
                <div className={s.visual}>
                  {cover ? (
                    <figure className={s.polaroid}>
                      <span className={s.tape} aria-hidden="true" />
                      <div className={s.photo}>
                        <Image src={cover.url} alt={cover.alt || v.name} fill sizes="(max-width: 900px) 92vw, 560px" priority={i === 0} />
                      </div>
                      <figcaption>{cover.alt || v.name}</figcaption>
                    </figure>
                  ) : (
                    <div className={s.placeholder} aria-hidden="true"><Icon id="paw" /><span>{v.name}</span></div>
                  )}
                  {more.length > 0 && (
                    <div className={s.more}>
                      {more.slice(0, 3).map((p) => (
                        <div key={p.path} className={s.moreItem}><Image src={p.url} alt={p.alt || v.name} fill sizes="180px" /></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={s.copy}>
                  <p className={s.kicker}>
                    <span className={s.idx}>{String(i + 1).padStart(2, "0")}</span>
                    {v.temporarily_unavailable
                      ? <span className={s.paused}>Temporarily paused</span>
                      : bookable
                        ? <span className={s.open}>Taking bookings</span>
                        : <span className={s.enquire}>Enquiries on WhatsApp</span>}
                  </p>
                  <h2 id={`h-${v.slug}`} className={s.h2}>{v.name}</h2>
                  {v.summary && <p className={s.summary}>{v.summary}</p>}
                  <p className={s.price}>{priceLabel(v)}</p>
                  {v.description && <p className={s.desc}>{v.description}</p>}

                  {v.inclusions.length > 0 && (
                    <ul className={s.incl}>{v.inclusions.map((x) => <li key={x}><Icon id="tick" />{x}</li>)}</ul>
                  )}

                  {v.packages.length > 0 && (
                    <div className={s.pkgs}>
                      {v.packages.map((p) => (
                        <div key={p.name} className={s.pkg}>
                          <b>{p.name}</b>
                          {p.price != null && <span className={s.pkgPrice}>₹{p.price.toLocaleString("en-IN")}<small> / month</small></span>}
                          {p.visits != null && <span>{p.visits} visits a month</span>}
                          {p.note && <span className={s.note}>{p.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <dl className={s.facts}>
                    {v.duration && <div><dt>Visit</dt><dd>{v.duration}</dd></div>}
                    {v.availability && <div><dt>Days</dt><dd>{v.availability}</dd></div>}
                    {v.service_area && <div><dt>Where</dt><dd>{v.service_area}</dd></div>}
                  </dl>

                  <div className={s.ctas}>
                    {bookable && <a className="btn btn-primary" href={`/book?service=${v.slug}`}>Request {v.name.toLowerCase()}</a>}
                    <a className={s.ghost} href={wa(`Hi AmityK9, I have a question about ${v.name.toLowerCase()}.`)}>
                      <span className="link-u">{bookable ? "Ask on WhatsApp" : "Message us on WhatsApp"}</span><span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {!services.length && <p className={`wrap ${s.lede}`}>Our services are being updated. Please message us on WhatsApp.</p>}
      </main>
      <Footer />
    </>
  );
}

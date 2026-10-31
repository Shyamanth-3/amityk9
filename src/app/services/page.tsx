import type { Metadata } from "next";
import { publicDb } from "@/lib/supabase";
import { OG } from "@/lib/site";
import { priceLabel, type Service } from "@/lib/services";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Icon } from "@/components/Icons";
import s from "../public.module.css";

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
      <main className={`wrap ${s.page}`}>
        <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
        <h1 className={s.h1}>Our <em>services</em></h1>
        <p className={s.lede}>Everything we offer right now, inside your gated community. Pick one and send us a request; we&apos;ll confirm availability.</p>

        <div className={s.list}>
          {services.map((v) => {
            const bookable = v.booking_enabled && !v.temporarily_unavailable;
            return (
              <article key={v.id} id={v.slug} className={s.svc}>
                <div className={s.svcHead}>
                  <div>
                    <h2>{v.name}</h2>
                    {v.summary && <p className={s.summary}>{v.summary}</p>}
                  </div>
                  <p className={s.price}>{priceLabel(v)}</p>
                </div>
                {v.description && <p>{v.description}</p>}
                {v.inclusions.length > 0 && <ul className={s.incl}>{v.inclusions.map((i) => <li key={i}><Icon id="tick" />{i}</li>)}</ul>}
                {v.packages.length > 0 && (
                  <div className={s.pkgs}>
                    {v.packages.map((p) => (
                      <div key={p.name} className={s.pkg}>
                        <b>{p.name}</b>
                        {p.price != null && <span>₹{p.price.toLocaleString("en-IN")} / month</span>}
                        {p.visits != null && <span>{p.visits} visits a month</span>}
                        {p.note && <span>{p.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <p className={s.meta}>{[v.duration, v.availability, v.service_area].filter(Boolean).join(" · ")}</p>
                {bookable
                  ? <a className="btn btn-primary" href={`/book?service=${v.slug}`}>Request {v.name.toLowerCase()}</a>
                  : <p className={s.unavailable}>{v.temporarily_unavailable ? "Temporarily unavailable. Message us on WhatsApp to be notified." : "Message us on WhatsApp to ask about this service."}</p>}
              </article>
            );
          })}
          {!services.length && <p className={s.lede}>Our services are being updated. Please message us on WhatsApp.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

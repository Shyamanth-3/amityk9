import type { Metadata } from "next";
import { publicDb } from "@/lib/supabase";
import { OG } from "@/lib/site";
import type { MediaItem } from "@/lib/media";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Gallery from "./Gallery";
import s from "./gallery.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from AmityK9 walks and home visits in Hyderabad's gated communities.",
  alternates: { canonical: "/gallery" },
  openGraph: { ...OG, url: "/gallery" },
};

export default async function GalleryPage() {
  const { data } = await publicDb().from("media").select("id, kind, path, url, caption, published, display_order").eq("published", true).order("display_order");
  const items = (data ?? []) as MediaItem[];
  return (
    <>
      <Nav />
      <main className="wrap">
        <header className={s.head}>
          <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Gallery</span></nav>
          <h1 className={s.h1}>Out on <em>the paths.</em></h1>
          <p className={s.lede}>Sniffs, naps, stick finds and very good sits, straight from our walks and home visits.</p>
        </header>
        {items.length ? <Gallery items={items} /> : <p className={s.lede}>New photos are on their way. Check back soon.</p>}
      </main>
      <Footer />
    </>
  );
}

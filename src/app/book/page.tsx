import type { Metadata } from "next";
import { publicDb } from "@/lib/supabase";
import { OG } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingForm from "./BookingForm";
import s from "../public.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a booking",
  description: "Send AmityK9 a pet walking or pet sitting request. We'll confirm availability on WhatsApp or by phone.",
  alternates: { canonical: "/book" },
  openGraph: { ...OG, url: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const { data } = await publicDb().from("services").select("id, slug, name")
    .eq("status", "published").eq("booking_enabled", true).eq("temporarily_unavailable", false).order("display_order");
  const services = data ?? [];

  return (
    <>
      <Nav />
      <main className={`wrap ${s.page} ${s.narrow}`}>
        <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Request a booking</span></nav>
        <h1 className={s.h1}>Request a <em>booking</em></h1>
        <p className={s.lede}>Tell us about your pet and when you&apos;d like us. Sending this saves your request; we&apos;ll then confirm availability with you.</p>
        <BookingForm services={services} initial={services.find((v) => v.slug === service)?.id ?? ""} />
      </main>
      <Footer />
    </>
  );
}

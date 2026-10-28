import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import Updates from "@/components/Updates";
import Plans from "@/components/Plans";
import Know from "@/components/Know";
import Faq from "@/components/Faq";
import Book from "@/components/Book";
import Leash from "@/components/Leash";
import PageMotion from "@/components/PageMotion";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";
import { FAQ, OG } from "@/lib/site";
import { business, faqPage } from "@/lib/schema";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { ...OG, url: "/" } };

export default function Home() {
  return (
    <>
      <JsonLd data={[business(), faqPage(FAQ)]} />
      <Nav />
      <main style={{ position: "relative" }}>
        <Leash />
        <Hero />
        <Marquee />
        <Services />
        <Updates />
        <Plans />
        <Know />
        <Faq />
        <Book />
      </main>
      <Footer />
      <PageMotion />
    </>
  );
}

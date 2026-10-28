import type { Metadata } from "next";
import beagle from "@/assets/walking-beagle.webp";
import { FAQ, OG } from "@/lib/site";
import { breadcrumb, faqPage, service } from "@/lib/schema";
import Nav from "@/components/Nav";
import ServiceHero from "@/components/ServiceHero";
import Updates from "@/components/Updates";
import Plans from "@/components/Plans";
import Faq from "@/components/Faq";
import Book from "@/components/Book";
import Footer from "@/components/Footer";
import PageMotion from "@/components/PageMotion";
import JsonLd from "@/components/JsonLd";

const PATH = "/pet-walking-hyderabad";
const TITLE = "Dog walking in Hyderabad gated communities";
const DESC = "Supervised dog walks of about 30 minutes inside your gated community in Hyderabad. 3 to 6 walks a week, Monday to Saturday, from ₹2,499 a month with an update after every walk.";
const QS = [FAQ[2], FAQ[1], FAQ[4], FAQ[3]];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { ...OG, title: TITLE, description: DESC, url: PATH },
};

export default function WalkingPage() {
  return (
    <>
      <JsonLd data={[service("walk", PATH), faqPage(QS), breadcrumb("Pet walking", PATH)]} />
      <Nav />
      <main>
        <ServiceHero
          crumb="Pet walking"
          title={<>Dog walking in Hyderabad, <em>inside your community.</em></>}
          lede="Unhurried, supervised walks of about 30 minutes, 3 to 6 days a week, Monday to Saturday. The same walker every week, and an update on WhatsApp after every walk."
          image={beagle} alt="Beagle sniffing the grass during an AmityK9 walk in a Hyderabad gated community" caption="Coco, mid-walk"
          facts={[["~30 min", "per walk"], ["3 to 6", "walks a week"], ["From ₹2,499", "a month, one pet"]]}
          included={["Safe, supervised walks", "Fresh air and exercise", "Suitable for all breeds and sizes", "Update after each walk, photos if you like", "Same walker, every week", "Monday to Saturday, Sundays off"]}
          booking="Hi AmityK9, I'd like to book dog walks."
        />
        <Updates />
        <Plans initial="walk" />
        <Faq items={QS} num="04" />
        <Book initial="walk" />
      </main>
      <Footer />
      <PageMotion />
    </>
  );
}

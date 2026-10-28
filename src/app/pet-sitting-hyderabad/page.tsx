import type { Metadata } from "next";
import cat from "@/assets/sitting-cat.webp";
import { FAQ, OG } from "@/lib/site";
import { breadcrumb, faqPage, service } from "@/lib/schema";
import Nav from "@/components/Nav";
import ServiceHero from "@/components/ServiceHero";
import Plans from "@/components/Plans";
import Faq from "@/components/Faq";
import Book from "@/components/Book";
import Footer from "@/components/Footer";
import PageMotion from "@/components/PageMotion";
import JsonLd from "@/components/JsonLd";

const PATH = "/pet-sitting-hyderabad";
const TITLE = "Pet sitting in Hyderabad: home visits for cats and dogs";
const DESC = "45 to 60 minute home visits for cats and dogs in Hyderabad gated communities: feeding, play, litter and clean-up, medicines if required, with photo updates. Extra hours ₹599 for 4 hours.";
const QS = [FAQ[0], FAQ[1], FAQ[2], FAQ[3]];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: { ...OG, title: TITLE, description: DESC, url: PATH },
};

export default function SittingPage() {
  return (
    <>
      <JsonLd data={[service("sit", PATH), faqPage(QS), breadcrumb("Pet sitting", PATH)]} />
      <Nav />
      <main>
        <ServiceHero
          crumb="Pet sitting"
          title={<>Pet sitting in Hyderabad, <em>right at home.</em></>}
          lede="Loving care for your cat or dog while you're out or away. Visits of 45 to 60 minutes inside your gated community, with timings extended on request and photo updates as we go."
          image={cat} alt="Cat being petted during an AmityK9 home visit in Hyderabad" caption="Mochi, at home"
          facts={[["45–60 min", "per visit"], ["₹599", "for 4 extra hours"], ["From ₹2,499", "a month, one pet"]]}
          included={["Feeding and fresh water", "Playtime and company", "Litter box and clean-up", "Medicines, if required", "Regular photo updates", "Timings extended on request"]}
          booking="Hi AmityK9, I'd like to book pet sitting."
        />
        <Plans initial="sit" num="01" />
        <Faq items={QS} num="02" />
        <Book initial="sit" />
      </main>
      <Footer />
      <PageMotion />
    </>
  );
}

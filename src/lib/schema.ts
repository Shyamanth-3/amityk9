// schema.org JSON-LD builders. Only facts we actually publish on the site go in here.
import { NAME, PHONE, SITE_URL, PLANS, MODE_COPY, daysAWeek, type Mode } from "./site";

const ORG_ID = `${SITE_URL}/#business`;

export const business = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": ORG_ID,
  name: NAME,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  logo: `${SITE_URL}/icon.svg`,
  telephone: PHONE,
  description: "Pet walking and pet sitting inside gated communities in Hyderabad, Monday to Saturday, with a photo update after every visit.",
  address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
  areaServed: { "@type": "City", name: "Hyderabad" },
  openingHours: "Mo-Sa",
  priceRange: "₹2,499–₹4,999 per month",
});

export const service = (mode: Mode, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${MODE_COPY[mode].label} in Hyderabad`,
  serviceType: MODE_COPY[mode].label,
  url: `${SITE_URL}${path}`,
  provider: { "@id": ORG_ID },
  areaServed: { "@type": "City", name: "Hyderabad" },
  offers: PLANS.map((p) => ({
    "@type": "Offer",
    name: `${p.name} plan`,
    description: `${p.visits[mode]} ${MODE_COPY[mode].unit}, ${daysAWeek(p.visits[mode])} days a week, Monday to Saturday`,
    price: p.price,
    priceCurrency: "INR",
    priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "INR", unitText: "MONTH" },
  })),
});

export const faqPage = (items: readonly (readonly [string, string])[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const breadcrumb = (name: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
  ],
});

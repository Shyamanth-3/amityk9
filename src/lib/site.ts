// Single source of truth for business facts. Change SITE_URL before launch.
export const SITE_URL = "https://amityk9.in";
export const NAME = "AmityK9";
export const PHONE = "+919347692474";
export const PHONE_DISPLAY = "93476 92474";

// a page's openGraph replaces the layout's wholesale, so every page spreads this base in
// (including the image: child pages that set openGraph otherwise lose app/opengraph-image)
export const OG = {
  type: "website", siteName: NAME, locale: "en_IN",
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AmityK9: pet walking and sitting in Hyderabad's gated communities" }],
};

export const wa =(text?: string) =>
  `https://wa.me/${PHONE.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#updates", label: "Walk updates" },
  { href: "/#plans", label: "Plans" },
  { href: "/#faq", label: "Questions" },
];

export type Mode = "walk" | "sit";

export const PLANS = [
  { id: "bronze", name: "Bronze", sub: "For basic, regular care", price: 2499, visits: { walk: 12, sit: 8 }, dot: "#B07A4E",
    perks: ["Text or photo updates", "Good for owners who need a regular hand"] },
  { id: "silver", name: "Silver", sub: "For regular care", price: 3999, visits: { walk: 16, sit: 12 }, dot: "#9AA3A6",
    perks: ["Photo update after every visit", "Flexible scheduling around you"] },
  { id: "gold", name: "Gold", sub: "For consistent, premium care", price: 4999, visits: { walk: 24, sit: 16 }, dot: "#D8A23B",
    perks: ["Photo and video updates", "Priority booking", "Dedicated support"], popular: true },
] as const;

// visits a month → days a week (a month counted as 4 weeks): 12 → 3, 8 → 2
export const daysAWeek = (visits: number) => Math.round(visits / 4);

export const MODE_COPY: Record<Mode, { unit: string; dur: string; label: string }> = {
  walk: { unit: "walks a month", dur: "about 30 min each", label: "Pet walking" },
  sit: { unit: "visits a month", dur: "45–60 min each", label: "Pet sitting" },
};

export const FAQ = [
  ["Can a plan include both walks and sitting?", "Each plan covers either walks or sitting visits. If you need sitting outside your plan, book extra time at ₹599 for 4 hours."],
  ["I have two pets. Does one plan cover both?", "Plans are priced for one pet. Additional pets may be charged a little extra. Message us with their names and we'll sort out a fair price."],
  ["What kind of updates will I get?", "Text or photo updates on Bronze, a photo after every visit on Silver, and photos plus short videos on Gold."],
  ["How do refunds work?", "You have 2 days after payment to request a refund if you're not satisfied. After the 3rd day, the payment can't be refunded."],
  ["Do you work on Sundays or during festivals?", "Sundays are our rest day. During festival season we're open, but prices may change due to high demand."],
] as const;

export const inr =(n: number) => `₹${n.toLocaleString("en-IN")}`;

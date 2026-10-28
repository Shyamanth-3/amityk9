import type { Metadata } from "next";
import Legal from "@/components/Legal";
import { PHONE, PHONE_DISPLAY, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "AmityK9 plan terms: one pet per plan, Monday to Saturday visits, refunds within 2 days of payment, festival pricing and where we work.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <Legal title="Terms" updated="28 October 2026">
      <h2>Plans</h2>
      <ul>
        <li>Each plan covers either pet walking or pet sitting visits, for one pet. Additional pets may be charged extra.</li>
        <li>Plans run monthly. Unused visits expire at the end of the month.</li>
        <li>Walks last about 30 minutes; sitting visits last 45 to 60 minutes.</li>
        <li>Extra sitting outside your plan can be booked on normal days at ₹599 for 4 hours. Longer timings are available on request.</li>
      </ul>
      <h2>Days and festivals</h2>
      <ul>
        <li>We work Monday to Saturday. Sundays are our rest day.</li>
        <li>During festival season, when demand is high, prices for walking and sitting may change.</li>
      </ul>
      <h2>Payments and refunds</h2>
      <ul>
        <li>If you&apos;re not satisfied, you can ask for a refund within 2 days of payment.</li>
        <li>From the 3rd day after payment, payments can&apos;t be refunded.</li>
      </ul>
      <h2>Where we work</h2>
      <p>Services are available only inside the gated communities we serve, and are subject to availability and your pet&apos;s behaviour. We meet you and your pet before the first visit.</p>
      <h2>Questions</h2>
      <p><a href={wa("Hi AmityK9, I have a question about your terms.")}>Message us on WhatsApp</a> or call <a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>.</p>
    </Legal>
  );
}

import type { Metadata } from "next";
import Legal from "@/components/Legal";
import { PHONE, PHONE_DISPLAY, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AmityK9 handles your details: no tracking on this website, and your WhatsApp messages are used only to arrange care for your pet.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <Legal title="Privacy" updated="28 October 2026">
      <h2>This website</h2>
      <p>This site has no sign-up, no forms that send data to us, no advertising and no analytics or tracking cookies. The booking message builder runs only in your browser: it writes a WhatsApp message for you, and nothing is sent until you choose to send it from WhatsApp.</p>
      <p>Like any website, our hosting provider may keep standard server logs, such as IP addresses and pages requested, to keep the site secure and working.</p>
      <h2>When you contact us</h2>
      <p>If you message or call us, we receive your phone number and whatever you share, such as your name, your pet&apos;s name and needs, and your community. We use this only to reply, arrange visits and look after your pet.</p>
      <ul>
        <li>We don&apos;t sell or share your details with anyone for marketing.</li>
        <li>Photos and videos we take during visits are sent to you. We won&apos;t post them publicly without asking you first.</li>
        <li>Ask us at any time to see or delete what we hold about you.</li>
      </ul>
      <h2>Contact</h2>
      <p><a href={wa("Hi AmityK9, I have a question about my data.")}>Message us on WhatsApp</a> or call <a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>.</p>
    </Legal>
  );
}

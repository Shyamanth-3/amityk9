import type { Metadata } from "next";
import Legal from "@/components/Legal";
import { PHONE, PHONE_DISPLAY, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AmityK9 handles your details: what the booking form saves and why, who hosts it, and no advertising or tracking cookies.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <Legal title="Privacy" updated="4 November 2026">
      <h2>The booking form</h2>
      <p>When you send a request from the <a href="/book">booking page</a>, we save what you enter: the service, your name and mobile number, your pet&apos;s name and type, your community and block, your preferred start date and time, and any notes. We save it as soon as you press send, whether or not you also message us on WhatsApp afterwards.</p>
      <p>We use these details only to reply, arrange visits and look after your pet. They aren&apos;t shown anywhere on the public site. We see them in our private admin page, where we can mark a request&apos;s progress, add our own notes to it and download our requests as a spreadsheet for our records.</p>
      <h2>This website</h2>
      <p>This site has no visitor accounts, no advertising and no analytics or tracking cookies. The only cookies are the sign-in cookies for our own admin area, which visitors never reach.</p>
      <ul>
        <li>The site is hosted by Vercel. Booking requests and the photos we upload are stored with Supabase, our database provider.</li>
        <li>Like any website, our hosting provider may keep standard server logs, such as IP addresses and pages requested, to keep the site secure and working.</li>
        <li>Video previews in the <a href="/gallery">gallery</a> load thumbnail images from YouTube (i.ytimg.com). The YouTube player itself, from youtube-nocookie.com, only loads when you tap play.</li>
      </ul>
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

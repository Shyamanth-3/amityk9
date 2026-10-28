import type { Metadata, Viewport } from "next";
import { fraunces, dmSans, caveat } from "./fonts";
import { SITE_URL, NAME, OG } from "@/lib/site";
import { IconSprite } from "@/components/Icons";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${NAME} — Pet walking & sitting in Hyderabad`, template: `%s · ${NAME}` },
  description:
    "Pet walking and pet sitting for gated communities in Hyderabad. Monday to Saturday, with a photo update after every visit.",
  applicationName: NAME,
  // opengraph-image.tsx and icon.svg in this folder are picked up automatically
  openGraph: OG,
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#1E4A38" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${dmSans.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* lets CSS hide intro elements only when JS will animate them in */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}

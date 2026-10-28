import localFont from "next/font/local";

// *-web files: subset to Latin + ₹ and punctuation, Fraunces weight axis cut to the 380–600 the site uses
// (made with fontTools from the *-latin-* originals, which stay alongside)
export const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-web-normal.woff2", weight: "380 600", style: "normal" },
    { path: "../fonts/fraunces-web-italic.woff2", weight: "380 600", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const dmSans = localFont({
  src: "../fonts/dm-sans-web.woff2",
  weight: "100 1000",
  variable: "--font-dmsans",
  display: "swap",
});

export const caveat = localFont({
  src: "../fonts/caveat-latin-600-normal.woff2",
  weight: "600",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AmityK9 — Pet walking & sitting in Hyderabad",
    short_name: "AmityK9",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F0E4",
    theme_color: "#1E4A38",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}

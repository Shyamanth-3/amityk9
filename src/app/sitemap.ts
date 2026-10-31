import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "", priority: 1 },
    { path: "/pet-walking-hyderabad", priority: 0.9 },
    { path: "/pet-sitting-hyderabad", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/book", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ].map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, lastModified: new Date("2026-10-28"), priority }));
}

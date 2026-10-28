import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1366, 1600, 1920],
  },
  poweredByHeader: false,
};

export default config;

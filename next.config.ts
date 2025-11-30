import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Generate static pages for all locales
  experimental: {
    optimizePackageImports: ["@/components", "@/i18n"],
  },
};

export default nextConfig;

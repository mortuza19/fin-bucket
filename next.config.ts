import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Configure Next.js to generate PWA artifacts into /public so sw.js is
// served as a static asset. Disable PWA in development to avoid cached assets
// interfering with local hot reload and debugging.
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
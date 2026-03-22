import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      { protocol: "https", hostname: "*.openai.com" },
    ],
  },

  // Prevent build-time evaluation of server-only packages
  serverExternalPackages: [
    "@neondatabase/serverless",
    "drizzle-orm",
    "bcryptjs",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

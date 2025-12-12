import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 requires explicit turbopack config when using custom webpack
  turbopack: {},

  // Increase body size limit for Server Actions (PPTX/PDF files can be large)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  webpack: (config) => {
    // Canvas fallback for browser environment
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.canvas = false;

    return config;
  },
};

export default nextConfig;

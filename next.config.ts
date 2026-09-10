import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Keep the pg driver unbundled so its dynamic requires resolve at runtime.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;

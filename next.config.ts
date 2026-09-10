import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Self-hosted on a VM behind Caddy: emit a minimal standalone server bundle
  // that the Dockerfile copies and runs as `node server.js`.
  output: "standalone",
  // Keep the pg driver as a real Node dependency (not bundled) so its native
  // connection code is traced into .next/standalone/node_modules.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;

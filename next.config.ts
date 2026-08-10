import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext Cloudflare does not support edge runtime export
  poweredByHeader: false,
};

export default nextConfig;

// Bindings in local `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

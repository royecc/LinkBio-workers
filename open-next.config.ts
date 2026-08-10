import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config (no R2 cache required for this app — pages are force-dynamic)
export default defineCloudflareConfig({});

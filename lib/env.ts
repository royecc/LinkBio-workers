import type { BioStore } from "./kv";
import { BioStore as Store } from "./kv";

export type CloudflareEnv = {
  BIO_KV: KVNamespace;
  SITE_NAME: string;
  SITE_URL: string;
  DEFAULT_THEME: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
};

/**
 * Resolve Cloudflare bindings.
 * - On OpenNext / Workers: getCloudflareContext
 * - Local next dev with initOpenNextCloudflareForDev: same
 */
export async function getEnv(): Promise<CloudflareEnv> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as CloudflareEnv;
  } catch (e) {
    // Fallback for tooling without bindings (typecheck / broken local)
    throw new Error(
      "Cloudflare bindings unavailable. Run with `npm run dev` after OpenNext Cloudflare dev init, or `npm run preview`.",
    );
  }
}

export async function getStore(): Promise<BioStore> {
  const env = await getEnv();
  return new Store(env.BIO_KV);
}

export async function getSiteName(): Promise<string> {
  const env = await getEnv();
  return env.SITE_NAME || "LinkBio";
}

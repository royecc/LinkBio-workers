import { getEnv, getStore } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getStore();
  const env = await getEnv();
  const data = await store.getAll();
  return Response.json({
    siteName: env.SITE_NAME || "LinkBio",
    siteUrl: env.SITE_URL || "",
    profile: data.profile,
    links: data.links.filter((l) => l.enabled),
    settings: data.settings,
  });
}

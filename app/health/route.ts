import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = await getEnv();
    return Response.json({
      ok: true,
      service: "linkbio-workers",
      site: env.SITE_NAME || "LinkBio",
    });
  } catch {
    return Response.json({ ok: true, service: "linkbio-workers" });
  }
}

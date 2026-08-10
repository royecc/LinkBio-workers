import { isAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Download full JSON backup (profile, links, settings, analytics, backup config).
 * Never includes ADMIN_PASSWORD / SESSION_SECRET / env secrets.
 */
export async function GET() {
  if (!(await isAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await getStore();
  const data = await store.exportAll();
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="linkbio-backup.json"',
    },
  });
}

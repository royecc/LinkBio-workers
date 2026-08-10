import { getStore } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let id = "";
  try {
    const body = (await req.json()) as { id?: string };
    id = typeof body.id === "string" ? body.id.slice(0, 64) : "";
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const store = await getStore();
  void store.incrementLinkClick(id);
  return Response.json({ ok: true });
}

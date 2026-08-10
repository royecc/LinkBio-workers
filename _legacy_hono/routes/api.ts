import { Hono } from "hono";
import type { AuthVariables } from "../middleware/auth";
import { requireAdmin } from "../middleware/auth";
import {
  createStore,
  sanitizeLink,
  sanitizeProfile,
  sanitizeSettings,
} from "../services/kv";
import type { LinkItem, Profile, Settings, SiteData } from "../types";

const api = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

/** Public: record link click (beacon / fetch) */
api.post("/click", async (c) => {
  let id = "";
  try {
    const body = await c.req.json<{ id?: string }>();
    id = typeof body.id === "string" ? body.id.slice(0, 64) : "";
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  if (!id) return c.json({ error: "Missing id" }, 400);

  const store = createStore(c.env);
  c.executionCtx.waitUntil(store.incrementLinkClick(id));
  return c.json({ ok: true });
});

/** Public: minimal site payload (no admin secrets) */
api.get("/site", async (c) => {
  const store = createStore(c.env);
  const data = await store.getAll();
  return c.json({
    siteName: c.env.SITE_NAME || "LinkBio",
    siteUrl: c.env.SITE_URL || "",
    profile: data.profile,
    links: data.links.filter((l) => l.enabled),
    settings: data.settings,
  });
});

// ── Admin JSON API (session cookie required) ───────────────────

const adminApi = new Hono<{ Bindings: Env; Variables: AuthVariables }>();
adminApi.use("*", requireAdmin);

adminApi.get("/export", async (c) => {
  const store = createStore(c.env);
  const data = await store.exportAll();
  return c.json(data);
});

adminApi.put("/profile", async (c) => {
  let body: Partial<Profile>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const store = createStore(c.env);
  const profile = sanitizeProfile(body);
  await store.setProfile(profile);
  return c.json({ ok: true, profile });
});

adminApi.put("/links", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  if (!Array.isArray(body)) return c.json({ error: "Expected array" }, 400);
  const links: LinkItem[] = body.map((item, i) => sanitizeLink(item as Partial<LinkItem>, i));
  const store = createStore(c.env);
  await store.setLinks(links);
  return c.json({ ok: true, links });
});

adminApi.put("/settings", async (c) => {
  let body: Partial<Settings>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const store = createStore(c.env);
  const settings = sanitizeSettings(body);
  await store.setSettings(settings);
  return c.json({ ok: true, settings });
});

adminApi.post("/import", async (c) => {
  let body: Partial<SiteData>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const store = createStore(c.env);
  await store.importAll(body);
  return c.json({ ok: true });
});

api.route("/admin", adminApi);

export { api };

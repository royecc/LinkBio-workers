import { Hono } from "hono";
import type { AuthVariables } from "../middleware/auth";
import { requireAdmin } from "../middleware/auth";
import {
  buildCsrfCookie,
  CSRF_FIELD,
  generateCsrfToken,
  isSecureRequest,
  parseCsrfFromCookie,
  validateCsrf,
} from "../middleware/security";
import { renderAdminDashboard, renderLoginPage, type AdminPage } from "../admin/dashboard";
import {
  clientIp,
  createStore,
  sanitizeLink,
  sanitizeProfile,
  sanitizeSettings,
} from "../services/kv";
import {
  buildClearSessionCookie,
  buildSessionCookie,
  constantTimeEqual,
  createSessionToken,
} from "../services/session";
import { createT, type TranslateFn } from "../i18n";
import type { LinkItem, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const admin = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

function ensureSecretsKey(c: { env: Env }): "admin.login.error.noPassword" | "admin.login.error.noSessionSecret" | null {
  if (!c.env.ADMIN_PASSWORD) return "admin.login.error.noPassword";
  if (!c.env.SESSION_SECRET) return "admin.login.error.noSessionSecret";
  return null;
}

function siteName(env: Env): string {
  return env.SITE_NAME || "LinkBio";
}

function tFor(settings: Settings): TranslateFn {
  return createT(settings.locale);
}

function okMsg(t: TranslateFn, key: string): string {
  return "ok:" + t(key);
}

function errMsg(t: TranslateFn, key: string, vars?: Record<string, string | number>): string {
  return "error:" + t(key, vars);
}

/** Ensure a CSRF token exists; returns token + optional Set-Cookie to attach on Response. */
function withCsrf(c: {
  req: { header: (n: string) => string | undefined; url: string };
}): { token: string; setCookie?: string } {
  const existing = parseCsrfFromCookie(c.req.header("Cookie"));
  if (existing && existing.length >= 16) return { token: existing };
  const token = generateCsrfToken();
  return { token, setCookie: buildCsrfCookie(token, isSecureRequest(c)) };
}

function withSetCookie(res: Response, cookie?: string): Response {
  if (!cookie) return res;
  const out = new Response(res.body, res);
  out.headers.append("Set-Cookie", cookie);
  return out;
}

async function requireCsrf(c: {
  req: { header: (n: string) => string | undefined; parseBody: () => Promise<Record<string, string | File>> };
}): Promise<{ ok: true; body: Record<string, string> } | { ok: false }> {
  const body = await c.req.parseBody();
  const form: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "string") form[k] = v;
  }
  const cookieToken = parseCsrfFromCookie(c.req.header("Cookie"));
  const formToken = form[CSRF_FIELD];
  if (!validateCsrf(cookieToken, formToken)) {
    return { ok: false };
  }
  return { ok: true, body: form };
}

// ── Login ─────────────────────────────────────────────────────

admin.get("/login", async (c) => {
  if (c.get("isAdmin")) return c.redirect("/admin");
  const store = createStore(c.env);
  const settings = await store.getSettings().catch(() => ({ ...DEFAULT_SETTINGS }));
  const t = tFor(settings);
  const csrf = withCsrf(c);
  const cfgKey = ensureSecretsKey(c);
  return withSetCookie(
    renderLoginPage({
      siteName: siteName(c.env),
      settings,
      csrf: csrf.token,
      error: cfgKey ? t(cfgKey) : undefined,
    }),
    csrf.setCookie,
  );
});

admin.post("/login", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings().catch(() => ({ ...DEFAULT_SETTINGS }));
  const t = tFor(settings);
  const csrf = withCsrf(c);
  const ip = clientIp(c);

  const cfgKey = ensureSecretsKey(c);
  if (cfgKey) {
    return withSetCookie(
      renderLoginPage({ siteName: siteName(c.env), settings, csrf: csrf.token, error: t(cfgKey) }),
      csrf.setCookie,
    );
  }

  const lockMinutes = await store.checkLoginRateLimit(ip);
  if (lockMinutes !== null) {
    return withSetCookie(
      renderLoginPage({
        siteName: siteName(c.env),
        settings,
        csrf: csrf.token,
        error: t("admin.login.error.rateLimit", { minutes: lockMinutes }),
      }),
      csrf.setCookie,
    );
  }

  const checked = await requireCsrf(c);
  if (!checked.ok) {
    return withSetCookie(
      renderLoginPage({
        siteName: siteName(c.env),
        settings,
        csrf: csrf.token,
        error: t("admin.login.error.csrf"),
      }),
      csrf.setCookie,
    );
  }

  const password = checked.body.password || "";
  const ok = await constantTimeEqual(password, c.env.ADMIN_PASSWORD);
  if (!ok) {
    await store.recordLoginFailure(ip);
    return withSetCookie(
      renderLoginPage({
        siteName: siteName(c.env),
        settings,
        csrf: csrf.token,
        error: t("admin.login.error.password"),
      }),
      csrf.setCookie,
    );
  }

  await store.clearLoginRateLimit(ip);
  const token = await createSessionToken(c.env.SESSION_SECRET);
  const secure = isSecureRequest(c);
  const res = c.redirect("/admin", 302);
  res.headers.append("Set-Cookie", buildSessionCookie(token, secure));
  res.headers.append("Set-Cookie", buildCsrfCookie(generateCsrfToken(), secure));
  return res;
});

/** GET logout is intentionally a no-op redirect (prevent CSRF logout via image/link). */
admin.get("/logout", (c) => c.redirect("/admin/login", 302));

/** Logout must be POST + CSRF */
admin.post("/logout", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings().catch(() => ({ ...DEFAULT_SETTINGS }));
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  const secure = isSecureRequest(c);
  if (!checked.ok) {
    return c.redirect(`/admin?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`, 302);
  }
  const res = c.redirect("/admin/login", 302);
  res.headers.append("Set-Cookie", buildClearSessionCookie(secure));
  return res;
});

// ── Authenticated pages ───────────────────────────────────────

const authed = new Hono<{ Bindings: Env; Variables: AuthVariables }>();
authed.use("*", requireAdmin);

async function page(
  c: {
    env: Env;
    req: { header: (n: string) => string | undefined; url: string; query: (k: string) => string | undefined };
  },
  which: AdminPage,
  message?: string,
) {
  const store = createStore(c.env);
  const [profile, links, settings, analytics] = await Promise.all([
    store.getProfile(),
    store.getLinks(),
    store.getSettings(),
    store.getAnalytics(),
  ]);
  const csrf = withCsrf(c);
  const msg = message ?? c.req.query("msg");
  return withSetCookie(
    renderAdminDashboard({
      siteName: siteName(c.env),
      settings,
      profile,
      links,
      analytics,
      csrf: csrf.token,
      page: which,
      message: msg,
    }),
    csrf.setCookie,
  );
}

authed.get("/", (c) => page(c, "overview"));
authed.get("/profile", (c) => page(c, "profile"));
authed.get("/links", (c) => page(c, "links"));
authed.get("/theme", (c) => page(c, "theme"));
authed.get("/data", (c) => page(c, "data"));

authed.get("/export", async (c) => {
  const store = createStore(c.env);
  const data = await store.exportAll();
  return c.json(data, 200, {
    "Content-Disposition": 'attachment; filename="linkbio-backup.json"',
  });
});

// ── Form posts ────────────────────────────────────────────────

authed.post("/profile", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/profile?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const b = checked.body;
  await store.setProfile(
    sanitizeProfile({
      name: b.name,
      username: b.username,
      bio: b.bio,
      avatar: b.avatar,
      location: b.location,
      email: b.email,
    }),
  );
  return c.redirect("/admin/profile?msg=" + encodeURIComponent(okMsg(t, "admin.profile.saved")));
});

authed.post("/settings", async (c) => {
  const store = createStore(c.env);
  const current = await store.getSettings();
  const t = tFor(current);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/theme?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const b = checked.body;
  const next = sanitizeSettings({
    theme: b.theme,
    accentColor: b.accentColor,
    background: b.background,
    colorMode: b.colorMode as never,
    locale: b.locale as never,
    showFooter: b.showFooter === "1",
    footerMode: b.footerMode as never,
    footerText: b.footerText,
  });
  await store.setSettings(next);
  // Re-translate flash with NEW locale so user sees success in the language they just chose
  const tNext = tFor(next);
  return c.redirect("/admin/theme?msg=" + encodeURIComponent(okMsg(tNext, "admin.theme.saved")));
});

authed.post("/links", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/links?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const b = checked.body;
  const links = await store.getLinks();
  const maxOrder = links.reduce((m, l) => Math.max(m, l.order), -1);
  const item = sanitizeLink(
    {
      id: crypto.randomUUID(),
      title: b.title,
      url: b.url,
      icon: b.icon,
      order: maxOrder + 1,
      enabled: b.enabled === "1",
    },
    maxOrder + 1,
  );
  if (!item.url) {
    return c.redirect("/admin/links?msg=" + encodeURIComponent(errMsg(t, "admin.links.invalidUrl")));
  }
  links.push(item);
  await store.setLinks(links);
  return c.redirect("/admin/links?msg=" + encodeURIComponent(okMsg(t, "admin.links.added")));
});

authed.post("/links/:id/delete", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/links?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const id = c.req.param("id");
  const links = (await store.getLinks()).filter((l) => l.id !== id);
  await store.setLinks(links.map((l, i) => ({ ...l, order: i })));
  return c.redirect("/admin/links?msg=" + encodeURIComponent(okMsg(t, "admin.links.deleted")));
});

authed.post("/links/:id/toggle", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/links?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const id = c.req.param("id");
  const links = await store.getLinks();
  const next = links.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l));
  await store.setLinks(next);
  return c.redirect("/admin/links?msg=" + encodeURIComponent(okMsg(t, "admin.links.updated")));
});

authed.post("/links/:id/up", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/links?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  return reorder(c, c.req.param("id"), -1, t);
});

authed.post("/links/:id/down", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/links?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  return reorder(c, c.req.param("id"), 1, t);
});

async function reorder(
  c: { env: Env; redirect: (u: string) => Response },
  id: string,
  dir: -1 | 1,
  t: TranslateFn,
): Promise<Response> {
  const store = createStore(c.env);
  const links = (await store.getLinks()).sort((a, b) => a.order - b.order);
  const idx = links.findIndex((l) => l.id === id);
  if (idx < 0) return c.redirect("/admin/links");
  const swap = idx + dir;
  if (swap < 0 || swap >= links.length) return c.redirect("/admin/links");
  const tmp = links[idx]!;
  links[idx] = links[swap]!;
  links[swap] = tmp;
  const normalized: LinkItem[] = links.map((l, i) => ({ ...l, order: i }));
  await store.setLinks(normalized);
  return c.redirect("/admin/links?msg=" + encodeURIComponent(okMsg(t, "admin.links.reordered")));
}

authed.post("/import", async (c) => {
  const store = createStore(c.env);
  const settings = await store.getSettings();
  const t = tFor(settings);
  const checked = await requireCsrf(c);
  if (!checked.ok) return c.redirect(`/admin/data?msg=${encodeURIComponent(errMsg(t, "admin.error.csrf"))}`);
  const raw = checked.body.json || "";
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    await store.importAll({
      profile: data.profile as never,
      links: data.links as never,
      settings: data.settings as never,
      analytics: data.analytics as never,
    });
    const after = await store.getSettings();
    const tAfter = tFor(after);
    return c.redirect("/admin/data?msg=" + encodeURIComponent(okMsg(tAfter, "admin.data.imported")));
  } catch {
    return c.redirect("/admin/data?msg=" + encodeURIComponent(errMsg(t, "admin.data.invalidJson")));
  }
});

admin.route("/", authed);

export { admin };

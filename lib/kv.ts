import {
  DEFAULT_ANALYTICS,
  DEFAULT_BACKUP_CONFIG,
  DEFAULT_BACKUP_STATE,
  DEFAULT_LINKS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  KV_KEYS,
  LOGIN_RATE_LIMIT,
  type Analytics,
  type BackupConfig,
  type BackupPayload,
  type BackupState,
  type ColorMode,
  type FooterMode,
  type LinkItem,
  type Locale,
  type Profile,
  type Settings,
  type SiteData,
} from "./types";

/**
 * Typed KV helpers for BIO_KV.
 * All reads fall back to safe defaults so a fresh namespace works immediately.
 *
 * Analytics notes (eventual consistency):
 * - Counters use split keys (analytics:pv, analytics:click:<id>) so page views
 *   and link clicks do not clobber each other.
 * - Cloudflare KV is eventually consistent: concurrent increments can still
 *   lose updates under high contention. For a personal bio page this is
 *   usually acceptable. For strict accuracy, move counters to a Durable Object.
 * - Increments retry a few times on conflicting re-reads.
 */
export class BioStore {
  constructor(private readonly kv: KVNamespace) {}

  async getProfile(): Promise<Profile> {
    return (await this.getJson<Profile>(KV_KEYS.PROFILE)) ?? { ...DEFAULT_PROFILE };
  }

  async setProfile(profile: Profile): Promise<void> {
    await this.kv.put(KV_KEYS.PROFILE, JSON.stringify(profile));
  }

  async getLinks(): Promise<LinkItem[]> {
    const links = await this.getJson<LinkItem[]>(KV_KEYS.LINKS);
    if (!links) return DEFAULT_LINKS.map((l) => ({ ...l }));
    return links.sort((a, b) => a.order - b.order);
  }

  async setLinks(links: LinkItem[]): Promise<void> {
    const normalized = links
      .map((l, i) => ({ ...l, order: typeof l.order === "number" ? l.order : i }))
      .sort((a, b) => a.order - b.order);
    await this.kv.put(KV_KEYS.LINKS, JSON.stringify(normalized));
  }

  async getSettings(): Promise<Settings> {
    const raw = await this.getJson<Partial<Settings>>(KV_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return sanitizeSettings(raw);
  }

  async setSettings(settings: Settings): Promise<void> {
    await this.kv.put(KV_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Aggregate analytics from split keys; migrate legacy blob if present.
   */
  async getAnalytics(): Promise<Analytics> {
    const [pvRaw, updatedRaw, legacy] = await Promise.all([
      this.kv.get(KV_KEYS.ANALYTICS_PV, "text"),
      this.kv.get(KV_KEYS.ANALYTICS_UPDATED, "text"),
      this.getJson<Analytics>(KV_KEYS.ANALYTICS),
    ]);

    // Prefer split keys when any exist
    if (pvRaw !== null || updatedRaw !== null) {
      const pageViews = parseNonNegInt(pvRaw, 0);
      const linkClicks = await this.listClickCounters();
      return {
        pageViews,
        linkClicks,
        lastUpdated: updatedRaw || new Date(0).toISOString(),
      };
    }

    if (legacy) {
      // One-time style migrate: write split keys so future increments are safer
      await this.persistSplitAnalytics(legacy).catch(() => {
        /* best-effort */
      });
      return sanitizeAnalytics(legacy);
    }

    return { ...DEFAULT_ANALYTICS };
  }

  async setAnalytics(analytics: Analytics): Promise<void> {
    const clean = sanitizeAnalytics(analytics);
    await this.persistSplitAnalytics(clean);
    // Keep legacy blob in sync for older backups / tools
    await this.kv.put(KV_KEYS.ANALYTICS, JSON.stringify(clean));
  }

  async getAll(): Promise<SiteData> {
    const [profile, links, settings, analytics] = await Promise.all([
      this.getProfile(),
      this.getLinks(),
      this.getSettings(),
      this.getAnalytics(),
    ]);
    return { profile, links, settings, analytics };
  }

  async getBackupConfig(): Promise<BackupConfig> {
    const raw = await this.getJson<Partial<BackupConfig>>(KV_KEYS.BACKUP_CONFIG);
    if (!raw) return { ...DEFAULT_BACKUP_CONFIG, webdav: { ...DEFAULT_BACKUP_CONFIG.webdav }, gist: { ...DEFAULT_BACKUP_CONFIG.gist } };
    return sanitizeBackupConfig(raw);
  }

  async setBackupConfig(config: BackupConfig): Promise<void> {
    await this.kv.put(KV_KEYS.BACKUP_CONFIG, JSON.stringify(sanitizeBackupConfig(config)));
  }

  async getBackupState(): Promise<BackupState> {
    const raw = await this.getJson<Partial<BackupState>>(KV_KEYS.BACKUP_STATE);
    if (!raw) return { ...DEFAULT_BACKUP_STATE };
    return sanitizeBackupState(raw);
  }

  async setBackupState(state: BackupState): Promise<void> {
    await this.kv.put(KV_KEYS.BACKUP_STATE, JSON.stringify(sanitizeBackupState(state)));
  }

  /**
   * Local / remote backup document.
   * Never includes env secrets (ADMIN_PASSWORD, SESSION_SECRET, …).
   */
  async exportBackup(options?: { includeAnalytics?: boolean; includeBackupConfig?: boolean }): Promise<BackupPayload> {
    const includeAnalytics = options?.includeAnalytics !== false;
    const includeBackupConfig = options?.includeBackupConfig !== false;
    const [profile, links, settings, analytics, backup] = await Promise.all([
      this.getProfile(),
      this.getLinks(),
      this.getSettings(),
      includeAnalytics ? this.getAnalytics() : Promise.resolve(null),
      includeBackupConfig ? this.getBackupConfig() : Promise.resolve(null),
    ]);
    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      links,
      settings,
    };
    if (analytics) payload.analytics = analytics;
    if (backup) payload.backup = backup;
    return payload;
  }

  async exportAll(): Promise<BackupPayload> {
    return this.exportBackup({ includeAnalytics: true, includeBackupConfig: true });
  }

  async importAll(
    data: Partial<SiteData> & { backup?: Partial<BackupConfig>; version?: number },
  ): Promise<void> {
    const ops: Promise<void>[] = [];
    if (data.profile) ops.push(this.setProfile(sanitizeProfile(data.profile)));
    if (data.links) ops.push(this.setLinks(data.links.map(sanitizeLink)));
    if (data.settings) ops.push(this.setSettings(sanitizeSettings(data.settings)));
    if (data.analytics) ops.push(this.setAnalytics(sanitizeAnalytics(data.analytics)));
    if (data.backup) ops.push(this.setBackupConfig(sanitizeBackupConfig(data.backup)));
    await Promise.all(ops);
  }

  /**
   * Increment page views with short retry to reduce lost updates.
   * Still eventually consistent under concurrent writers �?see class docs.
   */
  async incrementPageViews(): Promise<void> {
    await this.incrementCounter(KV_KEYS.ANALYTICS_PV);
  }

  async incrementLinkClick(linkId: string): Promise<void> {
    const safeId = linkId.replace(/[^a-zA-Z0-9._:-]/g, "").slice(0, 64);
    if (!safeId) return;
    await this.incrementCounter(`${KV_KEYS.ANALYTICS_CLICK_PREFIX}${safeId}`);
  }

  // ── Login rate limit ──────────────────────────────────────────

  /**
   * Returns null if allowed, or remaining lockout minutes if locked out.
   */
  async checkLoginRateLimit(ip: string): Promise<number | null> {
    const state = await this.getLoginRate(ip);
    if (!state) return null;
    const now = Math.floor(Date.now() / 1000);
    if (now >= state.resetAt) return null;
    if (state.failures >= LOGIN_RATE_LIMIT.maxFailures) {
      return Math.max(1, Math.ceil((state.resetAt - now) / 60));
    }
    return null;
  }

  async recordLoginFailure(ip: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const key = rateLoginKey(ip);
    const state = await this.getLoginRate(ip);
    if (!state || now >= state.resetAt) {
      await this.kv.put(
        key,
        JSON.stringify({ failures: 1, resetAt: now + LOGIN_RATE_LIMIT.windowSeconds }),
        { expirationTtl: LOGIN_RATE_LIMIT.windowSeconds + 60 },
      );
      return;
    }
    const failures = state.failures + 1;
    const ttl = Math.max(60, state.resetAt - now + 60);
    await this.kv.put(key, JSON.stringify({ failures, resetAt: state.resetAt }), {
      expirationTtl: ttl,
    });
  }

  async clearLoginRateLimit(ip: string): Promise<void> {
    await this.kv.delete(rateLoginKey(ip));
  }

  // ── Internals ─────────────────────────────────────────────────

  private async incrementCounter(key: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      const raw = await this.kv.get(key, "text");
      const current = parseNonNegInt(raw, 0);
      const next = current + 1;
      await this.kv.put(key, String(next));
      // Best-effort verify; if another writer won, retry
      const verify = parseNonNegInt(await this.kv.get(key, "text"), 0);
      if (verify >= next) {
        await this.kv.put(KV_KEYS.ANALYTICS_UPDATED, new Date().toISOString());
        return;
      }
    }
    // Last attempt without verify
    const raw = await this.kv.get(key, "text");
    await this.kv.put(key, String(parseNonNegInt(raw, 0) + 1));
    await this.kv.put(KV_KEYS.ANALYTICS_UPDATED, new Date().toISOString());
  }

  private async listClickCounters(): Promise<Record<string, number>> {
    const clicks: Record<string, number> = {};
    let cursor: string | undefined;
    do {
      const page = await this.kv.list({
        prefix: KV_KEYS.ANALYTICS_CLICK_PREFIX,
        cursor,
        limit: 1000,
      });
      for (const key of page.keys) {
        const id = key.name.slice(KV_KEYS.ANALYTICS_CLICK_PREFIX.length);
        if (!id) continue;
        const v = parseNonNegInt(await this.kv.get(key.name, "text"), 0);
        if (v > 0) clicks[id] = v;
      }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    return clicks;
  }

  private async persistSplitAnalytics(analytics: Analytics): Promise<void> {
    const ops: Promise<unknown>[] = [
      this.kv.put(KV_KEYS.ANALYTICS_PV, String(analytics.pageViews)),
      this.kv.put(KV_KEYS.ANALYTICS_UPDATED, analytics.lastUpdated || new Date().toISOString()),
    ];
    for (const [id, count] of Object.entries(analytics.linkClicks || {})) {
      const safeId = id.replace(/[^a-zA-Z0-9._:-]/g, "").slice(0, 64);
      if (!safeId) continue;
      ops.push(this.kv.put(`${KV_KEYS.ANALYTICS_CLICK_PREFIX}${safeId}`, String(Math.max(0, Math.floor(count)))));
    }
    await Promise.all(ops);
  }

  private async getLoginRate(ip: string): Promise<{ failures: number; resetAt: number } | null> {
    const raw = await this.kv.get(rateLoginKey(ip), "text");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { failures?: number; resetAt?: number };
      if (typeof parsed.failures !== "number" || typeof parsed.resetAt !== "number") return null;
      return { failures: parsed.failures, resetAt: parsed.resetAt };
    } catch {
      return null;
    }
  }

  private async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, "text");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}

export function createStore(kv: KVNamespace): BioStore {
  return new BioStore(kv);
}

function rateLoginKey(ip: string): string {
  const safe = (ip || "unknown").replace(/[^a-zA-Z0-9:._-]/g, "_").slice(0, 80);
  return `${KV_KEYS.RATE_LOGIN_PREFIX}${safe}`;
}

function parseNonNegInt(raw: string | null, fallback: number): number {
  if (raw === null || raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

// ── Sanitizers (defense in depth for imports / API) ─────────────

function str(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

const FOOTER_MODES: FooterMode[] = ["default", "custom", "auth_only", "off"];

export function sanitizeProfile(input: Partial<Profile>): Profile {
  return {
    name: str(input.name, 80) || DEFAULT_PROFILE.name,
    username: str(input.username, 40).replace(/[^a-zA-Z0-9._-]/g, "") || DEFAULT_PROFILE.username,
    bio: str(input.bio, 500) || "",
    avatar: str(input.avatar, 2000),
    location: str(input.location, 120),
    email: str(input.email, 120),
  };
}

export function sanitizeLink(input: Partial<LinkItem>, index = 0): LinkItem {
  const id = str(input.id, 64) || crypto.randomUUID();
  return {
    id,
    title: str(input.title, 80) || "Link",
    url: sanitizeUrl(str(input.url, 2000)),
    icon: str(input.icon, 40) || "link",
    order: typeof input.order === "number" && Number.isFinite(input.order) ? input.order : index,
    enabled: input.enabled !== false,
  };
}

const COLOR_MODES: ColorMode[] = ["system", "light", "dark"];
const LOCALES: Locale[] = ["zh-CN", "en"];

/**
 * Migrate / normalize settings from KV or forms.
 * colorMode wins; legacy darkMode only used when colorMode is missing.
 */
export function sanitizeSettings(input: Partial<Settings> & { darkMode?: boolean }): Settings {
  const accent = str(input.accentColor, 20);
  const modeRaw = str(input.footerMode, 20) as FooterMode;
  const footerMode: FooterMode = FOOTER_MODES.includes(modeRaw) ? modeRaw : DEFAULT_SETTINGS.footerMode;

  const colorMode = resolveColorMode(input);
  const localeRaw = str(input.locale, 16) as Locale;
  const locale: Locale = LOCALES.includes(localeRaw) ? localeRaw : DEFAULT_SETTINGS.locale;
  // Visual pack id (src/themes/<id>); migrate legacy ids
  // Keep empty so render can fall through to env.DEFAULT_THEME
  let themeId = str(input.theme, 40);
  if (themeId === "default" || themeId === "base") themeId = "aurora";
  if (themeId === "old") themeId = "hono-old";
  if (themeId === "ios27") themeId = "liquid-glass";

  return {
    theme: themeId,
    colorMode,
    // Derived mirror for older clients / exports
    darkMode: colorMode === "dark",
    locale,
    accentColor: /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : DEFAULT_SETTINGS.accentColor,
    background: str(input.background, 2000),
    showFooter: input.showFooter !== false && footerMode !== "off",
    footerMode: input.showFooter === false ? "off" : footerMode,
    footerText: str(input.footerText, 500),
  };
}

function resolveColorMode(input: Partial<Settings> & { darkMode?: boolean }): ColorMode {
  const raw = str(input.colorMode, 16) as ColorMode;
  if (COLOR_MODES.includes(raw)) return raw;
  // Legacy: only darkMode present
  if (typeof input.darkMode === "boolean") {
    return input.darkMode ? "dark" : "light";
  }
  return DEFAULT_SETTINGS.colorMode;
}

export function sanitizeAnalytics(input: Partial<Analytics>): Analytics {
  const clicks: Record<string, number> = {};
  if (input.linkClicks && typeof input.linkClicks === "object") {
    for (const [k, v] of Object.entries(input.linkClicks)) {
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        clicks[str(k, 64)] = Math.floor(v);
      }
    }
  }
  return {
    pageViews:
      typeof input.pageViews === "number" && Number.isFinite(input.pageViews)
        ? Math.max(0, Math.floor(input.pageViews))
        : 0,
    linkClicks: clicks,
    lastUpdated:
      typeof input.lastUpdated === "string" && input.lastUpdated
        ? input.lastUpdated
        : new Date().toISOString(),
  };
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString();
  } catch {
    return "";
  }
}

export function sanitizeBackupConfig(input: Partial<BackupConfig>): BackupConfig {
  const webdavIn: Partial<BackupConfig["webdav"]> =
    input.webdav && typeof input.webdav === "object" ? input.webdav : {};
  const gistIn: Partial<BackupConfig["gist"]> =
    input.gist && typeof input.gist === "object" ? input.gist : {};
  let minInterval =
    typeof input.minIntervalSec === "number" && Number.isFinite(input.minIntervalSec)
      ? Math.floor(input.minIntervalSec)
      : DEFAULT_BACKUP_CONFIG.minIntervalSec;
  if (minInterval < 60) minInterval = 60;
  if (minInterval > 86400 * 7) minInterval = 86400 * 7;

  const filename =
    str(gistIn.filename, 120).replace(/[^\w.\-()+@ ]/g, "") || DEFAULT_BACKUP_CONFIG.gist.filename;

  // Gist fine-grained PATs (github_pat_…) can exceed 200 chars; keep headroom.
  // Do not trim passwords aggressively mid-string — only ends (str() trims ends).
  let token = str(gistIn.token, 512);
  token = token.replace(/^(Bearer|token)\s+/i, "").trim();

  return {
    autoBackup: Boolean(input.autoBackup),
    minIntervalSec: minInterval,
    includeAnalytics: input.includeAnalytics !== false,
    webdav: {
      enabled: Boolean(webdavIn.enabled),
      url: sanitizeUrl(str(webdavIn.url, 2000)),
      username: str(webdavIn.username, 200),
      // App passwords can be long; avoid over-truncation
      password: str(webdavIn.password, 512),
    },
    gist: {
      enabled: Boolean(gistIn.enabled),
      token,
      gistId: str(gistIn.gistId, 64).replace(/[^a-fA-F0-9]/g, ""),
      filename: filename.endsWith(".json") ? filename : `${filename}.json`,
    },
  };
}

export function sanitizeBackupState(input: Partial<BackupState>): BackupState {
  const targets = Array.isArray(input.lastTargets)
    ? input.lastTargets.filter((t): t is string => typeof t === "string").map((t) => str(t, 32))
    : [];
  const source = input.lastSource === "auto" || input.lastSource === "manual" ? input.lastSource : "";
  return {
    lastAttemptAt: str(input.lastAttemptAt, 40),
    lastSuccessAt: str(input.lastSuccessAt, 40),
    lastOk: Boolean(input.lastOk),
    lastError: str(input.lastError, 500),
    lastTargets: targets.slice(0, 8),
    lastSource: source,
  };
}

/** Reject any accidental secret keys in imported JSON blobs. */
export function stripForbiddenSecrets(data: Record<string, unknown>): Record<string, unknown> {
  const forbidden = new Set([
    "ADMIN_PASSWORD",
    "SESSION_SECRET",
    "adminPassword",
    "sessionSecret",
    "password",
    "secret",
  ]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (forbidden.has(k)) continue;
    // Nested env-like bags
    if (k === "env" || k === "secrets" || k === "vars") continue;
    out[k] = v;
  }
  return out;
}

/** Client IP from CF / proxy headers (best-effort). */
export function clientIpFromHeaders(h: Headers): string {
  return (
    h.get("cf-connecting-ip") ||
    h.get("true-client-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    "unknown"
  );
}

/** Shared domain types for LinkBio-workers */

export interface Profile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  enabled: boolean;
}

/**
 * Footer behaviour on the public page:
 * - default: site name only (or footerText if set)
 * - custom: footerText only (falls back to default if empty)
 * - auth_only: same content, but only when admin is logged in
 * - off: never show footer
 */
export type FooterMode = "default" | "custom" | "auth_only" | "off";

/** Color appearance: follow OS, or force light/dark */
export type ColorMode = "system" | "light" | "dark";

/** UI locale for public + admin chrome (user content is not translated) */
export type Locale = "zh-CN" | "en";

export interface Settings {
  theme: string;
  /**
   * Preferred color mode. Default `system` follows prefers-color-scheme.
   * Legacy `darkMode` is only used when migrating old KV rows.
   */
  colorMode: ColorMode;
  /**
   * @deprecated Read-only compatibility. Prefer `colorMode`.
   * Still written as a derived mirror for older tools: dark when colorMode==="dark".
   */
  darkMode: boolean;
  /** UI language for SSR chrome (zh-CN | en) */
  locale: Locale;
  accentColor: string;
  background: string;
  /** Master switch; false hides footer regardless of footerMode */
  showFooter: boolean;
  /** How footer is rendered when showFooter is true */
  footerMode: FooterMode;
  /** Custom footer text (plain text; HTML-escaped). Empty → site name */
  footerText: string;
}

export interface Analytics {
  pageViews: number;
  linkClicks: Record<string, number>;
  lastUpdated: string;
}

export interface SiteData {
  profile: Profile;
  links: LinkItem[];
  settings: Settings;
  analytics: Analytics;
}

/** KV key names */
export const KV_KEYS = {
  PROFILE: "profile",
  LINKS: "links",
  SETTINGS: "settings",
  /** Legacy single-blob analytics (migrated on read) */
  ANALYTICS: "analytics",
  /** Split counters — fewer lost updates under concurrent writes */
  ANALYTICS_PV: "analytics:pv",
  ANALYTICS_CLICK_PREFIX: "analytics:click:",
  ANALYTICS_UPDATED: "analytics:updated",
  /** Login rate-limit: rate:login:<ip> */
  RATE_LOGIN_PREFIX: "rate:login:",
} as const;

export const DEFAULT_PROFILE: Profile = {
  name: "Your Name",
  username: "username",
  bio: "Write a short bio about yourself.",
  avatar: "",
  location: "",
  email: "",
};

export const DEFAULT_LINKS: LinkItem[] = [
  {
    id: "link-github",
    title: "GitHub",
    url: "https://github.com",
    icon: "github",
    order: 0,
    enabled: true,
  },
  {
    id: "link-website",
    title: "Website",
    url: "https://example.com",
    icon: "globe",
    order: 1,
    enabled: true,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: "default",
  colorMode: "system",
  darkMode: false,
  locale: "zh-CN",
  accentColor: "#6366f1",
  background: "",
  showFooter: true,
  footerMode: "default",
  footerText: "",
};

export const DEFAULT_ANALYTICS: Analytics = {
  pageViews: 0,
  linkClicks: {},
  lastUpdated: new Date(0).toISOString(),
};

export type SessionPayload = {
  sub: "admin";
  exp: number;
  iat: number;
};

/** Login rate limit defaults */
export const LOGIN_RATE_LIMIT = {
  /** Max failed attempts inside the window */
  maxFailures: 5,
  /** Window length in seconds */
  windowSeconds: 15 * 60,
} as const;

import type { ColorMode, Locale } from "../types";
import { localeFromAcceptLanguage } from "../i18n";

export const COLOR_COOKIE = "lb_color";
export const LOCALE_COOKIE = "lb_locale";
export const COLOR_STORAGE_KEY = "lb_color";

export type LocalePref = "auto" | Locale;

const COLOR_MODES: ColorMode[] = ["system", "light", "dark"];
const LOCALE_PREFS: LocalePref[] = ["auto", "zh-CN", "en"];
const LOCALES: Locale[] = ["zh-CN", "en"];

/** Parse a single cookie value from Cookie header */
export function getCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      try {
        return decodeURIComponent(rest.join("=") || "") || null;
      } catch {
        return rest.join("=") || null;
      }
    }
  }
  return null;
}

export function parseColorMode(raw: string | null | undefined): ColorMode | null {
  if (!raw) return null;
  return COLOR_MODES.includes(raw as ColorMode) ? (raw as ColorMode) : null;
}

export function parseLocalePref(raw: string | null | undefined): LocalePref | null {
  if (!raw) return null;
  return LOCALE_PREFS.includes(raw as LocalePref) ? (raw as LocalePref) : null;
}

/**
 * Color priority:
 * 1. visitor cookie lb_color
 * 2. site settings.colorMode
 * 3. system
 */
export function resolveColorMode(
  cookieHeader: string | undefined,
  siteDefault: ColorMode | undefined,
): ColorMode {
  const fromCookie = parseColorMode(getCookie(cookieHeader, COLOR_COOKIE));
  if (fromCookie) return fromCookie;
  if (siteDefault && COLOR_MODES.includes(siteDefault)) return siteDefault;
  return "system";
}

/**
 * Locale preference (what the toolbar shows): cookie or auto.
 */
export function resolveLocalePref(cookieHeader: string | undefined): LocalePref {
  return parseLocalePref(getCookie(cookieHeader, LOCALE_COOKIE)) ?? "auto";
}

/**
 * Effective UI locale for SSR:
 * 1. cookie zh-CN | en → locked
 * 2. cookie auto → Accept-Language → site default → zh-CN
 * 3. no cookie → site default → Accept-Language → zh-CN
 */
export function resolveLocale(
  cookieHeader: string | undefined,
  acceptLanguage: string | undefined,
  siteDefault: Locale | undefined,
): { pref: LocalePref; locale: Locale } {
  const pref = resolveLocalePref(cookieHeader);
  const site = siteDefault && LOCALES.includes(siteDefault) ? siteDefault : undefined;

  if (pref === "zh-CN" || pref === "en") {
    return { pref, locale: pref };
  }

  // auto (explicit cookie) — browser first
  if (getCookie(cookieHeader, LOCALE_COOKIE) === "auto") {
    const fromAl = localeFromAcceptLanguage(acceptLanguage);
    return { pref: "auto", locale: fromAl || site || "zh-CN" };
  }

  // no cookie — site default first, then browser
  if (site) return { pref: "auto", locale: site };
  return {
    pref: "auto",
    locale: localeFromAcceptLanguage(acceptLanguage) || "zh-CN",
  };
}

export function buildPrefCookie(name: string, value: string, secure: boolean): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

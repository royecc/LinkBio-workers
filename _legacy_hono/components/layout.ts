import { escapeHtml } from "../middleware/security";
import { createT, htmlLang } from "../i18n";
import type { ColorMode, Locale, Settings } from "../types";
import { appCss as css } from "../styles/app.css.js";

export type LayoutOptions = {
  title: string;
  siteName: string;
  settings: Settings;
  /** Effective theme after cookie/site resolution (defaults to settings.colorMode) */
  colorMode?: ColorMode;
  /** Effective locale after cookie/Accept-Language/site resolution */
  locale?: Locale;
  bodyClass?: string;
  headExtra?: string;
  children: string;
  /** Override meta description (already plain text; will be escaped) */
  description?: string;
};

/**
 * Full HTML document wrapper (SSR). CSS is inlined for zero extra round-trips.
 */
export function renderLayout(opts: LayoutOptions): string {
  const colorMode: ColorMode = opts.colorMode || opts.settings.colorMode || "system";
  const locale: Locale = opts.locale || opts.settings.locale || "zh-CN";
  const themeAttr = escapeHtml(colorMode);
  const colorSchemeMeta =
    colorMode === "system" ? "light dark" : colorMode === "light" ? "light" : "dark";
  const lang = escapeHtml(htmlLang(locale));
  const accent = escapeHtml(opts.settings.accentColor || "#6366f1");
  const title = escapeHtml(opts.title);
  const bodyClass = escapeHtml(opts.bodyClass || "");
  const t = createT(locale);
  const description = escapeHtml(
    opts.description ?? t("public.metaDescription", { siteName: opts.siteName }),
  );

  return `<!DOCTYPE html>
<html lang="${lang}" data-theme="${themeAttr}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="${colorSchemeMeta}" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <style>${css}</style>
  <style>:root { --accent: ${accent}; --accent-hover: color-mix(in srgb, ${accent} 80%, white); --accent-soft: color-mix(in srgb, ${accent} 18%, transparent); }</style>
  ${opts.headExtra || ""}
</head>
<body class="${bodyClass}">
${opts.children}
</body>
</html>`;
}

export function htmlResponse(html: string, status = 200, headers?: HeadersInit): Response {
  const h = new Headers(headers);
  h.set("Content-Type", "text/html; charset=utf-8");
  return new Response(html, { status, headers: h });
}

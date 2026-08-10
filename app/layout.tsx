import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { getEnv, getStore } from "@/lib/env";
import { htmlLang } from "@/lib/i18n";
import { COLOR_COOKIE, parseColorMode, resolveColorMode, resolveLocale } from "@/lib/prefs";
import { resolveThemeId } from "@/lib/themes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "LinkBio",
    template: "%s",
  },
  description: "Personal bio / digital card on Cloudflare Workers",
  icons: {
    icon: [{ url: "/icon", type: "image/svg+xml" }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const hdrs = await headers();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");

  let dataTheme = parseColorMode(jar.get(COLOR_COOKIE)?.value) || "system";
  let lang = "zh-CN";
  let themeId = "minimal";

  try {
    const store = await getStore();
    const env = await getEnv();
    const settings = await store.getSettings();
    dataTheme = resolveColorMode(cookieHeader, settings.colorMode);
    const { locale } = resolveLocale(
      cookieHeader,
      hdrs.get("accept-language") || undefined,
      settings.locale,
    );
    lang = htmlLang(locale);
    themeId = resolveThemeId(settings.theme, env.DEFAULT_THEME);
  } catch {
    /* keep defaults when KV unavailable (e.g. edge edge-cases) */
  }

  const colorScheme =
    dataTheme === "system" ? "light dark" : dataTheme === "light" ? "light" : "dark";

  return (
    <html
      lang={lang}
      data-theme={dataTheme}
      data-theme-id={themeId}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content={colorScheme} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('lb_color');if(m==='light'||m==='dark'||m==='system'){document.documentElement.setAttribute('data-theme',m);var meta=document.querySelector('meta[name="color-scheme"]');if(meta)meta.setAttribute('content',m==='system'?'light dark':m);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

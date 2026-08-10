import { redirect } from "next/navigation";
import { Button } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { InputArea } from "@cloudflare/kumo/components/input";
import { Label } from "@cloudflare/kumo/components/label";
import { saveSettingsAction } from "../actions";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminNav } from "@/components/admin/nav";
import { Flash } from "@/components/admin/flash";
import { AdminPanel } from "@/components/admin/panel";
import { isAdminSession } from "@/lib/auth";
import { getAdminUi } from "@/lib/admin-ui";
import { getCsrfToken } from "@/lib/csrf";
import { resolveAdminFlash } from "@/lib/flash";
import { themeDescription } from "@/lib/i18n";
import { CSRF_FIELD } from "@/lib/security";
import { listThemes, resolveThemeId } from "@/lib/themes";

export const dynamic = "force-dynamic";

/** Lightweight preview swatches (admin-only hint, not loaded from CSS) */
const PREVIEW: Record<string, { a: string; b: string; c: string }> = {
  aurora: { a: "hsl(232 78% 58%)", b: "hsl(175 55% 55%)", c: "hsl(230 40% 96%)" },
  base: { a: "hsl(232 78% 58%)", b: "hsl(175 55% 55%)", c: "hsl(230 40% 96%)" },
  minimal: { a: "hsl(0 0% 18%)", b: "hsl(0 0% 60%)", c: "hsl(0 0% 96%)" },
  "hono-old": { a: "#6366f1", b: "#0a0a0b", c: "#18181b" },
  anthropic: { a: "#D97757", b: "#E3DACC", c: "#FAF9F5" },
  apple: { a: "#0071e3", b: "#f5f5f7", c: "#ffffff" },
  "liquid-glass": { a: "#0A84FF", b: "#E8F1FA", c: "#FFFFFF" },
  md3: { a: "#6750A4", b: "#F3EDF7", c: "#FEF7FF" },
  miuix: { a: "#3482FF", b: "#F0F4FF", c: "#FFFFFF" },
  nodeseek: { a: "#0B6E99", b: "#E8F2F6", c: "#FFFFFF" },
  qtcool: { a: "#007AFF", b: "#F7F1E3", c: "#1a1a1a" },
  xandroid: { a: "#1D9BF0", b: "#0f1419", c: "#FFFFFF" },
  rin: { a: "#FC466B", b: "#f5f5f5", c: "#1c1c1e" },
};

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { store, env, settings, siteName, t, locale } = await getAdminUi();
  const csrf = await getCsrfToken();
  const sp = await searchParams;
  const flash = await resolveAdminFlash(sp.msg);
  const themes = listThemes();
  const currentThemeId = resolveThemeId(settings.theme, env.DEFAULT_THEME);
  const localeZh = locale === "zh-CN";
  const siteDefault = env.DEFAULT_THEME || "minimal";

  return (
    <div className="admin-shell">
      <AdminNav active="theme" siteName={siteName} csrf={csrf} t={t} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-kumo-strong">
          {t("admin.page.theme")}
        </h1>
        <p className="text-sm text-kumo-subtle">{t("admin.subtitle")}</p>
      </header>
      <AdminPanel title={t("admin.theme.title")}>
        <Flash message={flash} />
        <form action={saveSettingsAction} className="space-y-6">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />

          <div className="space-y-3">
            <Label>{t("admin.theme.theme")}</Label>
            <p className="text-xs text-kumo-subtle">
              {t("admin.theme.defaultThemeHint", {
                default: siteDefault,
                current: currentThemeId,
              })}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((th) => {
                const sw = PREVIEW[th.id] || PREVIEW.aurora!;
                const title = localeZh ? th.nameZh : th.name;
                const desc = themeDescription(t, th.id, th.description);
                return (
                  <label key={th.id} className="admin-theme-card">
                    <input
                      type="radio"
                      name="theme"
                      value={th.id}
                      defaultChecked={currentThemeId === th.id}
                      className="sr-only"
                    />
                    <div className="mb-2 flex gap-1">
                      <span className="h-6 flex-1 rounded-md" style={{ background: sw.a }} />
                      <span className="h-6 flex-1 rounded-md" style={{ background: sw.b }} />
                      <span className="h-6 flex-1 rounded-md" style={{ background: sw.c }} />
                    </div>
                    <div className="text-sm font-medium text-kumo-default">
                      {title}{" "}
                      <span className="font-mono text-xs text-kumo-subtle">({th.id})</span>
                    </div>
                    {desc ? (
                      <p className="mt-0.5 text-xs text-kumo-subtle">{desc}</p>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="accentColor"
              name="accentColor"
              label={t("admin.theme.accent")}
              defaultValue={settings.accentColor}
              pattern="#[0-9a-fA-F]{3,8}"
              placeholder={t("admin.theme.accentPlaceholder")}
              required={false}
            />
            <Input
              id="background"
              name="background"
              type="url"
              label={t("admin.theme.background")}
              defaultValue={settings.background}
              placeholder={t("admin.theme.backgroundPlaceholder")}
              required={false}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect
              id="colorMode"
              name="colorMode"
              label={t("admin.theme.colorMode")}
              defaultValue={settings.colorMode}
              options={[
                { value: "system", label: t("admin.theme.colorMode.system") },
                { value: "light", label: t("admin.theme.colorMode.light") },
                { value: "dark", label: t("admin.theme.colorMode.dark") },
              ]}
            />
            <AdminSelect
              id="locale"
              name="locale"
              label={t("admin.theme.locale")}
              defaultValue={settings.locale}
              options={[
                { value: "zh-CN", label: t("admin.theme.locale.zhCN") },
                { value: "en", label: t("admin.theme.locale.en") },
              ]}
            />
          </div>
          <div className="space-y-3 rounded-xl border border-kumo-hairline p-4">
            <h2 className="font-medium text-kumo-strong">{t("admin.theme.footerTitle")}</h2>
            <p className="text-xs text-kumo-subtle">{t("admin.theme.footerHint")}</p>
            <label className="flex items-center gap-2 text-sm text-kumo-default">
              <input
                type="checkbox"
                name="showFooter"
                value="1"
                defaultChecked={settings.showFooter && settings.footerMode !== "off"}
                className="size-4"
              />
              {t("admin.theme.showFooter")}
            </label>
            <AdminSelect
              id="footerMode"
              name="footerMode"
              label={t("admin.theme.footerMode")}
              defaultValue={settings.footerMode}
              options={[
                { value: "default", label: t("admin.theme.footerMode.default") },
                { value: "custom", label: t("admin.theme.footerMode.custom") },
                { value: "auth_only", label: t("admin.theme.footerMode.auth_only") },
                { value: "off", label: t("admin.theme.footerMode.off") },
              ]}
            />
            <InputArea
              id="footerText"
              name="footerText"
              label={t("admin.theme.footerText")}
              defaultValue={settings.footerText}
              maxLength={500}
              placeholder={t("admin.theme.footerTextPlaceholder")}
              description={t("admin.theme.footerTextHint")}
              rows={3}
              required={false}
            />
          </div>
          <Button type="submit" variant="primary">
            {t("admin.theme.save")}
          </Button>
        </form>
      </AdminPanel>
    </div>
  );
}

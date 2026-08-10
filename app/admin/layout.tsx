import { AdminPrefsToolbar } from "@/components/admin/prefs-toolbar";
import { getAdminUi, prefsToolbarLabels } from "@/lib/admin-ui";

/**
 * Map site color preference to Kumo's data-mode (light | dark).
 * "system" follows prefers-color-scheme at runtime via a tiny inline script.
 */
function modeFromPref(pref: string | null | undefined): "light" | "dark" | "system" {
  if (pref === "light" || pref === "dark") return pref;
  return "system";
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // CSRF is issued in middleware — never cookies().set during RSC render (Next 15 → 500).
  let colorMode: "system" | "light" | "dark" = "system";
  let localePref: "auto" | "zh-CN" | "en" = "auto";
  let labels = {
    color: "Color mode",
    system: "System",
    light: "Light",
    dark: "Dark",
    locale: "Language",
    auto: "Auto",
    zh: "中文",
    en: "English",
  };

  try {
    const ui = await getAdminUi();
    colorMode = ui.colorMode;
    localePref = ui.localePref;
    labels = prefsToolbarLabels(ui.t);
  } catch {
    /* bindings unavailable during some tool paths */
  }

  const mode = modeFromPref(colorMode);

  return (
    <div className="admin-kumo" data-mode={mode === "system" ? undefined : mode} data-admin-root>
      {mode === "system" ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=document.querySelector('[data-admin-root]');if(!r)return;var d=window.matchMedia('(prefers-color-scheme: dark)').matches;r.setAttribute('data-mode',d?'dark':'light');}catch(e){}})();`,
          }}
        />
      ) : null}
      <AdminPrefsToolbar colorMode={colorMode} localePref={localePref} labels={labels} />
      {children}
    </div>
  );
}

import type { Settings } from "@/lib/types";

export function SiteFooter({
  settings,
  siteName,
  isAdmin,
  defaultText,
}: {
  settings: Settings;
  siteName: string;
  isAdmin: boolean;
  defaultText: string;
}) {
  if (!settings.showFooter || settings.footerMode === "off") return null;
  if (settings.footerMode === "auth_only" && !isAdmin) return null;

  const custom = (settings.footerText || "").trim();
  const useCustom = settings.footerMode === "custom" || custom.length > 0;
  const text = useCustom && custom ? custom : defaultText || siteName;

  return (
    <footer className="theme-footer">
      <div className="whitespace-pre-line">{text}</div>
    </footer>
  );
}

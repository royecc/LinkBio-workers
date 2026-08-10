import Link from "next/link";
import { Button } from "@cloudflare/kumo/components/button";
import { logoutAction } from "@/app/admin/actions";
import { CSRF_FIELD } from "@/lib/security";
import type { TranslateFn } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", key: "overview" as const },
  { href: "/admin/profile", key: "profile" as const },
  { href: "/admin/links", key: "links" as const },
  { href: "/admin/theme", key: "theme" as const },
  { href: "/admin/data", key: "data" as const },
];

export function AdminNav({
  active,
  siteName,
  csrf,
  t,
}: {
  active: string;
  siteName: string;
  csrf: string;
  t: TranslateFn;
}) {
  return (
    <nav className="admin-nav">
      <div className="min-w-0 shrink">
        <Link
          href="/"
          className="inline-flex min-w-0 max-w-full items-baseline gap-2 truncate text-sm font-semibold tracking-tight text-kumo-strong transition-colors hover:text-kumo-link"
          title={t("admin.nav.homeTitle", { siteName })}
        >
          <span className="truncate">{siteName}</span>
          <span className="shrink-0 font-normal text-kumo-subtle">{t("admin.nav.console")}</span>
        </Link>
      </div>
      <div className="admin-nav-links">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors",
              active === item.key
                ? "bg-kumo-tint font-medium text-kumo-strong"
                : "text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default",
            )}
          >
            {t(`admin.nav.${item.key}`)}
          </Link>
        ))}
        <form action={logoutAction} className="inline-flex">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <Button type="submit" variant="ghost" size="sm" className="!text-kumo-danger">
            {t("admin.nav.logout")}
          </Button>
        </form>
      </div>
    </nav>
  );
}

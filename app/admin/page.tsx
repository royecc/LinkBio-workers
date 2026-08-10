import { redirect } from "next/navigation";
import { LinkButton } from "@cloudflare/kumo/components/button";
import { AdminNav } from "@/components/admin/nav";
import { AdminPanel } from "@/components/admin/panel";
import { isAdminSession } from "@/lib/auth";
import { getAdminUi } from "@/lib/admin-ui";
import { getCsrfToken } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { store, siteName, t } = await getAdminUi();
  const [profile, links, analytics] = await Promise.all([
    store.getProfile(),
    store.getLinks(),
    store.getAnalytics(),
  ]);
  const csrf = await getCsrfToken();
  const clicks = Object.values(analytics.linkClicks).reduce((a, b) => a + b, 0);

  return (
    <div className="admin-shell">
      <AdminNav active="overview" siteName={siteName} csrf={csrf} t={t} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-kumo-strong">
          {t("admin.page.overview")}
        </h1>
        <p className="text-sm text-kumo-subtle">{t("admin.subtitle")}</p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <AdminPanel>
          <p className="text-sm font-medium text-kumo-subtle">{t("admin.stats.pageViews")}</p>
          <p className="mt-1 text-3xl font-semibold text-kumo-strong">{analytics.pageViews}</p>
        </AdminPanel>
        <AdminPanel>
          <p className="text-sm font-medium text-kumo-subtle">{t("admin.stats.linkClicks")}</p>
          <p className="mt-1 text-3xl font-semibold text-kumo-strong">{clicks}</p>
        </AdminPanel>
        <AdminPanel>
          <p className="text-sm font-medium text-kumo-subtle">{t("admin.stats.lastUpdated")}</p>
          <p className="mt-1 text-sm font-medium text-kumo-default">
            {analytics.lastUpdated || t("admin.stats.empty")}
          </p>
        </AdminPanel>
      </div>

      <AdminPanel title={t("admin.overview.quickLinks")} className="mb-6">
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/profile" variant="secondary" size="sm">
            {t("admin.overview.editProfile")}
          </LinkButton>
          <LinkButton href="/admin/links" variant="secondary" size="sm">
            {t("admin.overview.manageLinks")}
          </LinkButton>
          <LinkButton href="/admin/theme" variant="secondary" size="sm">
            {t("admin.overview.theme")}
          </LinkButton>
          <LinkButton href="/admin/data" variant="secondary" size="sm">
            {t("admin.overview.data")}
          </LinkButton>
          <LinkButton href="/" target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
            {t("admin.overview.viewPublic")}
          </LinkButton>
        </div>
      </AdminPanel>

      <AdminPanel title={t("admin.overview.currentProfile")}>
        <div className="space-y-2 text-sm">
          <p className="text-kumo-default">
            <strong className="text-kumo-strong">{profile.name}</strong>
            {profile.username ? ` · @${profile.username}` : ""}
          </p>
          <p className="text-kumo-subtle">{profile.bio}</p>
          <p className="text-kumo-subtle">
            {t("admin.overview.enabledLinks", {
              count: links.filter((l) => l.enabled).length,
            })}
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}

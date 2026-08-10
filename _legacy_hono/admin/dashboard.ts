import { escapeHtml } from "../middleware/security";
import { htmlResponse, renderLayout } from "../components/layout";
import {
  renderDataPanel,
  renderLinksPanel,
  renderProfileForm,
  renderSettingsForm,
  renderStats,
} from "./forms";
import { createT, type TranslateFn } from "../i18n";
import type { Analytics, LinkItem, Profile, Settings } from "../types";

export type AdminPage =
  | "overview"
  | "profile"
  | "links"
  | "theme"
  | "data";

export type DashboardData = {
  siteName: string;
  settings: Settings;
  profile: Profile;
  links: LinkItem[];
  analytics: Analytics;
  csrf: string;
  page: AdminPage;
  message?: string;
};

export function renderAdminDashboard(data: DashboardData): Response {
  const t = createT(data.settings.locale);
  const nav = renderNav(data.page, data.siteName, data.csrf, t);
  let body = "";

  switch (data.page) {
    case "profile":
      body = renderProfileForm(data.profile, data.csrf, t, data.message);
      break;
    case "links":
      body = renderLinksPanel(data.links, data.csrf, t, data.message);
      break;
    case "theme":
      body = renderSettingsForm(data.settings, data.csrf, t, data.message);
      break;
    case "data":
      body = renderDataPanel(data.csrf, t, data.message);
      break;
    default:
      body = `
        ${renderStats(data.analytics, t)}
        <section class="panel">
          <h2>${escapeHtml(t("admin.overview.quickLinks"))}</h2>
          <div class="row-actions">
            <a class="btn btn-secondary" href="/admin/profile">${escapeHtml(t("admin.overview.editProfile"))}</a>
            <a class="btn btn-secondary" href="/admin/links">${escapeHtml(t("admin.overview.manageLinks"))}</a>
            <a class="btn btn-secondary" href="/admin/theme">${escapeHtml(t("admin.overview.theme"))}</a>
            <a class="btn btn-secondary" href="/admin/data">${escapeHtml(t("admin.overview.data"))}</a>
            <a class="btn btn-secondary" href="/" target="_blank" rel="noopener">${escapeHtml(t("admin.overview.viewPublic"))}</a>
          </div>
        </section>
        <section class="panel">
          <h2>${escapeHtml(t("admin.overview.currentProfile"))}</h2>
          <p style="margin:0;color:var(--text-secondary)">
            <strong>${escapeHtml(data.profile.name)}</strong>
            ${data.profile.username ? ` · @${escapeHtml(data.profile.username)}` : ""}
          </p>
          <p style="margin:8px 0 0;color:var(--text-muted);font-size:0.9rem">${escapeHtml(data.profile.bio)}</p>
          <p style="margin:12px 0 0;color:var(--text-muted);font-size:0.85rem">${escapeHtml(
            t("admin.overview.enabledLinks", {
              count: data.links.filter((l) => l.enabled).length,
            }),
          )}</p>
        </section>`;
  }

  const titles: Record<AdminPage, string> = {
    overview: t("admin.page.overview"),
    profile: t("admin.page.profile"),
    links: t("admin.page.links"),
    theme: t("admin.page.theme"),
    data: t("admin.page.data"),
  };

  const html = renderLayout({
    title: `${titles[data.page]} · ${t("admin.login.title")} · ${data.siteName}`,
    siteName: data.siteName,
    settings: data.settings,
    bodyClass: "admin-body",
    children: `
    <div class="admin-shell">
      ${nav}
      <header class="admin-header">
        <h1>${escapeHtml(titles[data.page])}</h1>
        <p>${escapeHtml(t("admin.subtitle"))}</p>
      </header>
      ${body}
    </div>`,
  });

  return htmlResponse(html);
}

export function renderLoginPage(opts: {
  siteName: string;
  settings: Settings;
  csrf: string;
  error?: string;
}): Response {
  const t = createT(opts.settings.locale);
  const html = renderLayout({
    title: `${t("admin.login.heading")} · ${opts.siteName}`,
    siteName: opts.siteName,
    settings: opts.settings,
    bodyClass: "admin-body",
    children: `
    <div class="login-page">
      <div class="login-card">
        <h1>${escapeHtml(t("admin.login.title"))}</h1>
        <p class="sub">${escapeHtml(t("admin.login.sub", { siteName: opts.siteName }))}</p>
        ${opts.error ? `<div class="alert alert-error">${escapeHtml(opts.error)}</div>` : ""}
        <form method="post" action="/admin/login">
          <input type="hidden" name="_csrf" value="${escapeHtml(opts.csrf)}" />
          <div class="field">
            <label for="password">${escapeHtml(t("admin.login.password"))}</label>
            <input id="password" name="password" type="password" required autocomplete="current-password" autofocus />
            <div class="hint">${escapeHtml(t("admin.login.hint"))}</div>
          </div>
          <div class="row-actions">
            <button class="btn" type="submit" style="width:100%">${escapeHtml(t("admin.login.submit"))}</button>
          </div>
        </form>
      </div>
    </div>`,
  });
  return htmlResponse(html);
}

function renderNav(page: AdminPage, siteName: string, csrf: string, t: TranslateFn): string {
  const items: { id: AdminPage | "logout" | "public"; href: string; label: string; danger?: boolean }[] = [
    { id: "overview", href: "/admin", label: t("admin.nav.overview") },
    { id: "profile", href: "/admin/profile", label: t("admin.nav.profile") },
    { id: "links", href: "/admin/links", label: t("admin.nav.links") },
    { id: "theme", href: "/admin/theme", label: t("admin.nav.theme") },
    { id: "data", href: "/admin/data", label: t("admin.nav.data") },
    { id: "public", href: "/", label: t("admin.nav.public") },
    { id: "logout", href: "/admin/logout", label: t("admin.nav.logout"), danger: true },
  ];

  const links = items
    .map((item) => {
      const active = item.id === page ? " active" : "";
      const danger = item.danger ? " danger" : "";
      if (item.id === "logout") {
        return `<form method="post" action="/admin/logout" class="nav-logout-form" style="display:inline;margin:0">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}" />
          <button type="submit" class="nav-link${danger}" style="background:none;border:0;padding:0;font:inherit;cursor:pointer;color:inherit">
            ${escapeHtml(item.label)}
          </button>
        </form>`;
      }
      return `<a class="nav-link${active}${danger}" href="${item.href}">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  return `
  <nav class="admin-nav">
    <div class="admin-brand">${escapeHtml(t("admin.brand"))}<span>${escapeHtml(siteName)}</span></div>
    <div class="admin-nav-links">${links}</div>
  </nav>`;
}

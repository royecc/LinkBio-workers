import { CSRF_FIELD, escapeHtml } from "../middleware/security";
import { ICON_OPTIONS } from "../components/icons";
import type { TranslateFn } from "../i18n";
import type { Analytics, LinkItem, Profile, Settings } from "../types";

export function csrfField(token: string): string {
  return `<input type="hidden" name="${CSRF_FIELD}" value="${escapeHtml(token)}" />`;
}

export function renderProfileForm(
  profile: Profile,
  csrf: string,
  t: TranslateFn,
  message?: string,
): string {
  return `
  <section class="panel">
    <h2>${escapeHtml(t("admin.profile.title"))}</h2>
    ${flash(message)}
    <form method="post" action="/admin/profile">
      ${csrfField(csrf)}
      <div class="grid-2">
        <div class="field">
          <label for="name">${escapeHtml(t("admin.profile.name"))}</label>
          <input id="name" name="name" value="${escapeHtml(profile.name)}" required maxlength="80" />
        </div>
        <div class="field">
          <label for="username">${escapeHtml(t("admin.profile.username"))}</label>
          <input id="username" name="username" value="${escapeHtml(profile.username)}" maxlength="40" pattern="[a-zA-Z0-9._-]*" />
        </div>
      </div>
      <div class="field">
        <label for="bio">${escapeHtml(t("admin.profile.bio"))}</label>
        <textarea id="bio" name="bio" maxlength="500">${escapeHtml(profile.bio)}</textarea>
      </div>
      <div class="field">
        <label for="avatar">${escapeHtml(t("admin.profile.avatar"))}</label>
        <input id="avatar" name="avatar" type="url" value="${escapeHtml(profile.avatar)}" maxlength="2000" placeholder="https://..." />
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="location">${escapeHtml(t("admin.profile.location"))}</label>
          <input id="location" name="location" value="${escapeHtml(profile.location)}" maxlength="120" />
        </div>
        <div class="field">
          <label for="email">${escapeHtml(t("admin.profile.email"))}</label>
          <input id="email" name="email" type="email" value="${escapeHtml(profile.email)}" maxlength="120" />
        </div>
      </div>
      <div class="row-actions">
        <button class="btn" type="submit">${escapeHtml(t("admin.profile.save"))}</button>
      </div>
    </form>
  </section>`;
}

export function renderSettingsForm(
  settings: Settings,
  csrf: string,
  t: TranslateFn,
  message?: string,
): string {
  return `
  <section class="panel">
    <h2>${escapeHtml(t("admin.theme.title"))}</h2>
    ${flash(message)}
    <form method="post" action="/admin/settings">
      ${csrfField(csrf)}
      <div class="grid-2">
        <div class="field">
          <label for="theme">${escapeHtml(t("admin.theme.theme"))}</label>
          <select id="theme" name="theme">
            ${option("default", t("admin.theme.themeDefault"), settings.theme)}
            ${option("minimal", t("admin.theme.themeMinimal"), settings.theme)}
            ${option("glass", t("admin.theme.themeGlass"), settings.theme)}
          </select>
        </div>
        <div class="field">
          <label for="accentColor">${escapeHtml(t("admin.theme.accent"))}</label>
          <input id="accentColor" name="accentColor" type="text" value="${escapeHtml(settings.accentColor)}" pattern="#[0-9a-fA-F]{3,8}" placeholder="#6366f1" />
        </div>
      </div>
      <div class="field">
        <label for="background">${escapeHtml(t("admin.theme.background"))}</label>
        <input id="background" name="background" type="url" value="${escapeHtml(settings.background)}" maxlength="2000" placeholder="https://..." />
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="colorMode">${escapeHtml(t("admin.theme.colorMode"))}</label>
          <select id="colorMode" name="colorMode">
            ${option("system", t("admin.theme.colorMode.system"), settings.colorMode)}
            ${option("light", t("admin.theme.colorMode.light"), settings.colorMode)}
            ${option("dark", t("admin.theme.colorMode.dark"), settings.colorMode)}
          </select>
        </div>
        <div class="field">
          <label for="locale">${escapeHtml(t("admin.theme.locale"))}</label>
          <select id="locale" name="locale">
            ${option("zh-CN", t("admin.theme.locale.zhCN"), settings.locale)}
            ${option("en", t("admin.theme.locale.en"), settings.locale)}
          </select>
        </div>
      </div>
      <hr class="sep" />
      <h2 style="margin-top:0">${escapeHtml(t("admin.theme.footerTitle"))}</h2>
      <p class="hint" style="color:var(--text-secondary);font-size:0.85rem;margin:0 0 12px">
        ${escapeHtml(t("admin.theme.footerHint"))}
      </p>
      <div class="field">
        <label class="check-row">
          <input type="checkbox" name="showFooter" value="1" ${settings.showFooter && settings.footerMode !== "off" ? "checked" : ""} />
          ${escapeHtml(t("admin.theme.showFooter"))}
        </label>
      </div>
      <div class="field">
        <label for="footerMode">${escapeHtml(t("admin.theme.footerMode"))}</label>
        <select id="footerMode" name="footerMode">
          ${option("default", t("admin.theme.footerMode.default"), settings.footerMode)}
          ${option("custom", t("admin.theme.footerMode.custom"), settings.footerMode)}
          ${option("auth_only", t("admin.theme.footerMode.auth_only"), settings.footerMode)}
          ${option("off", t("admin.theme.footerMode.off"), settings.footerMode)}
        </select>
      </div>
      <div class="field">
        <label for="footerText">${escapeHtml(t("admin.theme.footerText"))}</label>
        <textarea id="footerText" name="footerText" maxlength="500" placeholder="${escapeHtml(t("admin.theme.footerTextPlaceholder"))}">${escapeHtml(settings.footerText || "")}</textarea>
        <div class="hint">${escapeHtml(t("admin.theme.footerTextHint"))}</div>
      </div>
      <div class="row-actions">
        <button class="btn" type="submit">${escapeHtml(t("admin.theme.save"))}</button>
      </div>
    </form>
  </section>`;
}

export function renderLinksPanel(
  links: LinkItem[],
  csrf: string,
  t: TranslateFn,
  message?: string,
): string {
  const rows =
    links.length === 0
      ? `<div class="empty">${escapeHtml(t("admin.links.empty"))}</div>`
      : `<div class="links-list">${links
          .map((l) => {
            const badge = l.enabled
              ? `<span class="badge badge-on">${escapeHtml(t("admin.links.badgeOn"))}</span>`
              : `<span class="badge badge-off">${escapeHtml(t("admin.links.badgeOff"))}</span>`;
            return `
          <div class="link-row">
            <div>
              <div class="title">${escapeHtml(l.title)}${badge}</div>
              <div class="meta-line">${escapeHtml(
                t("admin.links.meta", { url: l.url, icon: l.icon, order: l.order }),
              )}</div>
            </div>
            <div class="row-actions" style="margin:0">
              <form method="post" action="/admin/links/${escapeHtml(l.id)}/toggle">
                ${csrfField(csrf)}
                <button class="btn btn-secondary btn-sm" type="submit">${escapeHtml(
                  l.enabled ? t("admin.links.disable") : t("admin.links.enable"),
                )}</button>
              </form>
              <form method="post" action="/admin/links/${escapeHtml(l.id)}/up">
                ${csrfField(csrf)}
                <button class="btn btn-secondary btn-sm" type="submit">↑</button>
              </form>
              <form method="post" action="/admin/links/${escapeHtml(l.id)}/down">
                ${csrfField(csrf)}
                <button class="btn btn-secondary btn-sm" type="submit">↓</button>
              </form>
              <form method="post" action="/admin/links/${escapeHtml(l.id)}/delete" onsubmit="return confirm('${escapeHtml(t("admin.links.deleteConfirm"))}')">
                ${csrfField(csrf)}
                <button class="btn btn-danger btn-sm" type="submit">${escapeHtml(t("admin.links.delete"))}</button>
              </form>
            </div>
          </div>`;
          })
          .join("")}</div>`;

  const iconOptions = ICON_OPTIONS.map((i) => option(i, i, "link")).join("");

  return `
  <section class="panel">
    <h2>${escapeHtml(t("admin.links.title"))}</h2>
    ${flash(message)}
    ${rows}
    <hr class="sep" />
    <h2>${escapeHtml(t("admin.links.add"))}</h2>
    <form method="post" action="/admin/links">
      ${csrfField(csrf)}
      <div class="grid-2">
        <div class="field">
          <label for="title">${escapeHtml(t("admin.links.fieldTitle"))}</label>
          <input id="title" name="title" required maxlength="80" />
        </div>
        <div class="field">
          <label for="icon">${escapeHtml(t("admin.links.icon"))}</label>
          <select id="icon" name="icon">${iconOptions}</select>
        </div>
      </div>
      <div class="field">
        <label for="url">${escapeHtml(t("admin.links.url"))}</label>
        <input id="url" name="url" type="url" required maxlength="2000" placeholder="https://" />
      </div>
      <div class="field">
        <label class="check-row">
          <input type="checkbox" name="enabled" value="1" checked />
          ${escapeHtml(t("admin.links.enabled"))}
        </label>
      </div>
      <div class="row-actions">
        <button class="btn" type="submit">${escapeHtml(t("admin.links.submit"))}</button>
      </div>
    </form>
  </section>`;
}

export function renderDataPanel(csrf: string, t: TranslateFn, message?: string): string {
  return `
  <section class="panel">
    <h2>${escapeHtml(t("admin.data.title"))}</h2>
    ${flash(message)}
    <p class="hint" style="color:var(--text-secondary);font-size:0.9rem;margin:0 0 14px">
      ${escapeHtml(t("admin.data.hint"))}
    </p>
    <div class="row-actions">
      <a class="btn btn-secondary" href="/admin/export">${escapeHtml(t("admin.data.export"))}</a>
    </div>
    <hr class="sep" />
    <form method="post" action="/admin/import">
      ${csrfField(csrf)}
      <div class="field">
        <label for="json">${escapeHtml(t("admin.data.importLabel"))}</label>
        <textarea id="json" name="json" required placeholder='{"profile":{...},"links":[...],"settings":{...}}'></textarea>
      </div>
      <div class="row-actions">
        <button class="btn" type="submit">${escapeHtml(t("admin.data.import"))}</button>
      </div>
    </form>
  </section>`;
}

export function renderStats(analytics: Analytics, t: TranslateFn): string {
  const clickTotal = Object.values(analytics.linkClicks).reduce((a, b) => a + b, 0);
  return `
  <section class="panel">
    <h2>${escapeHtml(t("admin.stats.title"))}</h2>
    <p class="hint" style="color:var(--text-muted);font-size:0.8rem;margin:0 0 12px">
      ${escapeHtml(t("admin.stats.hint"))}
    </p>
    <div class="stats">
      <div class="stat">
        <div class="label">${escapeHtml(t("admin.stats.pageViews"))}</div>
        <div class="value">${analytics.pageViews}</div>
      </div>
      <div class="stat">
        <div class="label">${escapeHtml(t("admin.stats.linkClicks"))}</div>
        <div class="value">${clickTotal}</div>
      </div>
      <div class="stat">
        <div class="label">${escapeHtml(t("admin.stats.lastUpdated"))}</div>
        <div class="value" style="font-size:0.95rem;margin-top:10px">${escapeHtml(analytics.lastUpdated || "—")}</div>
      </div>
    </div>
  </section>`;
}

function option(value: string, label: string, selected: string): string {
  const sel = value === selected ? " selected" : "";
  return `<option value="${escapeHtml(value)}"${sel}>${escapeHtml(label)}</option>`;
}

function flash(message?: string): string {
  if (!message) return "";
  const isError = message.startsWith("error:");
  const text = isError ? message.slice(6) : message.startsWith("ok:") ? message.slice(3) : message;
  const cls = isError ? "alert alert-error" : "alert alert-success";
  return `<div class="${cls}">${escapeHtml(text)}</div>`;
}

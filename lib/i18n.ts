import type { Locale } from "./types";

type Dict = Record<string, string>;

const en: Dict = {
  // Public
  "public.emptyLinks": "No links yet.",
  "public.metaDescription": "{siteName} — personal bio links",
  "public.linksNav": "Links",
  "public.footer.site": "{siteName}",
  "public.toolbar.color": "Color mode",
  "public.toolbar.color.system": "System",
  "public.toolbar.color.light": "Light",
  "public.toolbar.color.dark": "Dark",
  "public.toolbar.locale": "Language",
  "public.toolbar.locale.auto": "Auto",
  "public.toolbar.locale.zh": "中文",
  "public.toolbar.locale.en": "English",

  // Admin shell
  "admin.brand": "LinkBio",
  "admin.subtitle": "Manage your bio page content and appearance.",
  "admin.nav.overview": "Overview",
  "admin.nav.profile": "Profile",
  "admin.nav.links": "Links",
  "admin.nav.theme": "Theme",
  "admin.nav.data": "Data",
  "admin.nav.public": "Public",
  "admin.nav.console": "Admin",
  "admin.nav.homeTitle": "Open public site ({siteName})",
  "admin.nav.logout": "Logout",
  "admin.page.overview": "Dashboard",
  "admin.page.profile": "Profile",
  "admin.page.links": "Links",
  "admin.page.theme": "Theme",
  "admin.page.data": "Data",
  "admin.stats.empty": "—",
  "admin.links.urlPlaceholder": "https://",
  "admin.links.moveUp": "Move up",
  "admin.links.moveDown": "Move down",
  "admin.theme.defaultThemeHint": "Site default: {default} · Active: {current}",
  "admin.theme.accentPlaceholder": "#FC466B",
  "admin.theme.backgroundPlaceholder": "https://…",
  "admin.backup.secretPlaceholder": "••••••••",
  "admin.login.title": "Admin",
  "admin.login.heading": "Admin login",
  "admin.login.sub": "Sign in to manage {siteName}",
  "admin.login.password": "Password",
  "admin.login.hint": "Uses the ADMIN_PASSWORD secret — never stored in KV.",
  "admin.login.submit": "Sign in",
  "admin.login.error.csrf": "Invalid CSRF token. Refresh and try again.",
  "admin.login.error.password": "Incorrect password.",
  "admin.login.error.rateLimit": "Too many failed login attempts. Try again in about {minutes} minute(s).",
  "admin.login.error.noPassword": "ADMIN_PASSWORD secret is not configured.",
  "admin.login.error.noSessionSecret": "SESSION_SECRET secret is not configured.",

  // Overview
  "admin.overview.quickLinks": "Quick links",
  "admin.overview.editProfile": "Edit profile",
  "admin.overview.manageLinks": "Manage links",
  "admin.overview.theme": "Theme",
  "admin.overview.data": "Import / Export",
  "admin.overview.viewPublic": "View public site",
  "admin.overview.currentProfile": "Current profile",
  "admin.overview.enabledLinks": "{count} enabled link(s)",

  // Stats
  "admin.stats.title": "Analytics",
  "admin.stats.hint":
    "Counters use split KV keys with short retries. Under concurrent traffic, counts are eventually consistent and may slightly under-count.",
  "admin.stats.pageViews": "Page views",
  "admin.stats.linkClicks": "Link clicks",
  "admin.stats.lastUpdated": "Last updated",

  // Profile form
  "admin.profile.title": "Profile",
  "admin.profile.name": "Name",
  "admin.profile.username": "Username",
  "admin.profile.bio": "Bio",
  "admin.profile.avatar": "Avatar URL",
  "admin.profile.location": "Location",
  "admin.profile.email": "Email",
  "admin.profile.save": "Save profile",
  "admin.profile.saved": "Profile saved.",

  // Links form
  "admin.links.title": "Links",
  "admin.links.empty": "No links yet. Add one below.",
  "admin.links.add": "Add link",
  "admin.links.fieldTitle": "Title",
  "admin.links.icon": "Icon",
  "admin.links.icon.custom": "{id} (custom)",
  "admin.links.url": "URL",
  "admin.links.enabled": "Enabled",
  "admin.links.submit": "Add link",
  "admin.links.enable": "Enable",
  "admin.links.disable": "Disable",
  "admin.links.delete": "Delete",
  "admin.links.deleteConfirm": "Delete this link?",
  "admin.links.badgeOn": "On",
  "admin.links.badgeOff": "Off",
  "admin.links.meta": "{url} · icon: {icon} · order: {order}",
  "admin.links.added": "Link added.",
  "admin.links.deleted": "Link deleted.",
  "admin.links.updated": "Link updated.",
  "admin.links.reordered": "Order updated.",
  "admin.links.invalidUrl": "Invalid URL. Use http(s) only.",
  "admin.links.edit": "Edit",
  "admin.links.saveEdit": "Save changes",
  "admin.links.savedEdit": "Link saved.",
  "admin.links.cancelEdit": "Cancel",
  "admin.links.notFound": "Link not found.",

  // Theme form
  "admin.theme.title": "Theme & appearance",
  "admin.theme.theme": "Theme style",
  "admin.theme.themeDefault": "Default",
  "admin.theme.themeMinimal": "Minimal",
  "admin.theme.themeGlass": "Glass",
  "admin.theme.accent": "Accent color",
  "admin.theme.background": "Background image URL (optional)",
  "admin.theme.colorMode": "Color mode",
  "admin.theme.colorMode.system": "Auto (follow system)",
  "admin.theme.colorMode.light": "Light",
  "admin.theme.colorMode.dark": "Dark",
  "admin.theme.locale": "Language",
  "admin.theme.locale.zhCN": "中文 (zh-CN)",
  "admin.theme.locale.en": "English",
  "admin.theme.footerTitle": "Public footer",
  "admin.theme.footerHint":
    "Empty custom text falls back to the site name. Auth-only shows the footer only when you are logged in.",
  "admin.theme.showFooter": "Show footer",
  "admin.theme.footerMode": "Footer mode",
  "admin.theme.footerMode.default": "Default (site name)",
  "admin.theme.footerMode.custom": "Custom text only",
  "admin.theme.footerMode.auth_only": "Only when admin is logged in",
  "admin.theme.footerMode.off": "Always hidden",
  "admin.theme.footerText": "Custom footer text (optional)",
  "admin.theme.footerTextHint": "Plain text; line breaks are preserved. HTML is escaped.",
  "admin.theme.footerTextPlaceholder": "Leave empty for default: site name",
  "admin.theme.save": "Save theme",
  "admin.theme.saved": "Theme saved.",

  // Data
  "admin.data.title": "Data · Import / Export",
  "admin.data.hint":
    "Export JSON includes profile, links, settings, analytics, and optional backup config. Never includes ADMIN_PASSWORD / SESSION_SECRET. Import overwrites matching keys.",
  "admin.data.export": "Export JSON",
  "admin.data.importLabel": "Import JSON",
  "admin.data.import": "Import",
  "admin.data.importPlaceholder":
    '{"version":1,"profile":{...},"links":[...],"settings":{...},"backup":{...}}',
  "admin.data.imported": "Import successful.",
  "admin.data.invalidJson": "Invalid JSON.",

  // Remote backup
  "admin.backup.title": "Remote backup (optional)",
  "admin.backup.hint":
    "WebDAV and Gist can both be enabled; pushes run in parallel. Credentials are stored in KV as plain text you enter — not env secrets. Auto-backup runs after profile/links/settings saves (not analytics). Failures never block saving content.",
  "admin.backup.autoBackup": "Auto-backup after content saves",
  "admin.backup.includeAnalytics": "Include analytics in remote payload",
  "admin.backup.minInterval": "Min interval between auto backups (seconds)",
  "admin.backup.minIntervalHint": "Minimum 60. Manual backup ignores this.",
  "admin.backup.webdav": "WebDAV",
  "admin.backup.webdavEnable": "Enable WebDAV",
  "admin.backup.webdavUrl": "File URL",
  "admin.backup.webdavUrlPlaceholder": "https://dav.example.com/.../linkbio.json",
  "admin.backup.webdavUser": "Username",
  "admin.backup.webdavPass": "Password / app password",
  "admin.backup.gist": "GitHub Gist",
  "admin.backup.gistEnable": "Enable Gist",
  "admin.backup.gistToken": "Personal access token (gist scope)",
  "admin.backup.gistTokenPlaceholder": "ghp_…",
  "admin.backup.gistId": "Gist ID",
  "admin.backup.gistIdHint": "Leave empty to create a private gist on first successful backup.",
  "admin.backup.gistFilename": "Filename in gist",
  "admin.backup.secretKeep": "Leave blank to keep the previously saved value.",
  "admin.backup.saveConfig": "Save backup settings",
  "admin.backup.configSaved": "Backup settings saved.",
  "admin.backup.runNow": "Backup now",
  "admin.backup.runOk": "Backup finished.",
  "admin.backup.runOkPartial": "Backup finished with warnings: {details}",
  "admin.backup.runFail": "Backup failed.",
  "admin.backup.restoreWebdav": "Restore from WebDAV",
  "admin.backup.restoreGist": "Restore from Gist",
  "admin.backup.restoreOk": "Restored from remote backup.",
  "admin.backup.restoreFail": "Restore failed.",
  "admin.backup.restoreWarn": "Restore overwrites profile / links / settings (and analytics / backup config if present).",
  "admin.backup.statusNone": "No remote backup has been attempted yet.",
  "admin.backup.statusOk": "Last run: OK",
  "admin.backup.statusFail": "Last run: failed",
  "admin.backup.source": "Source",
  "admin.backup.source.manual": "Manual",
  "admin.backup.source.auto": "Auto",
  "admin.backup.targets": "Targets",
  "admin.backup.target.webdav": "WebDAV",
  "admin.backup.target.gist": "Gist",
  "admin.backup.lastSuccess": "Last success",
  "admin.backup.lastAttempt": "Last attempt",
  "admin.backup.lastError": "Error",
  "admin.backup.err.webdavUrlEmpty": "WebDAV URL is empty.",
  "admin.backup.err.webdavAuthRequired":
    "WebDAV returned 401 — set username and password (or app password).",
  "admin.backup.err.webdavHttp": "WebDAV HTTP {status}{detail}",
  "admin.backup.err.webdavFailed": "WebDAV request failed.",
  "admin.backup.err.webdavFetchFailed": "WebDAV download failed.",
  "admin.backup.err.gistTokenEmpty": "Gist token is empty.",
  "admin.backup.err.gistIdEmpty": "Gist ID is empty.",
  "admin.backup.err.gistHttp": "Gist HTTP {status}{detail}",
  "admin.backup.err.gistCreateHttp": "Gist create HTTP {status}{detail}",
  "admin.backup.err.gistCreateNoId": "Gist create failed: missing ID.",
  "admin.backup.err.gistFailed": "Gist request failed.",
  "admin.backup.err.gistNoFiles": "Gist has no files.",
  "admin.backup.err.gistRawHttp": "Gist raw HTTP {status}",
  "admin.backup.err.gistContentUnavailable": "Gist file content unavailable.",
  "admin.backup.err.gistFetchFailed": "Gist download failed.",
  "admin.backup.err.noTarget": "No backup target enabled.",
  "admin.backup.err.backupFailed": "Backup failed.",
  "admin.backup.err.invalidJson": "Invalid backup JSON.",
  "admin.backup.err.applyFailed": "Failed to apply backup.",
  "admin.backup.err.network": "Network error: {message}",
  "admin.backup.err.partial": "Partial: {details}",

  "admin.error.csrf": "Invalid CSRF token. Refresh and try again.",

  // Theme pack descriptions (admin theme picker; key = theme.desc.<id>)
  "theme.desc.aurora":
    "Northern lights default — cool teal–indigo, multi-stop aurora glow, dreamy elevation",
  "theme.desc.base":
    "Northern lights default — cool teal–indigo, multi-stop aurora glow, dreamy elevation",
  "theme.desc.minimal":
    "Ultra-minimal — near-square corners, no shadows/borders, monochrome ink, tight spacing",
  "theme.desc.apple":
    "Apple.com marketing — solid cool-gray tiles, SF stack, pill CTAs, first-link primary blue",
  "theme.desc.anthropic":
    "Editorial paper — oat page, ivory notes, clay accent, serif type, thick ink, no shadow",
  "theme.desc.hono-old":
    "Linear/Vercel-style dark — near-black, sharp indigo, strong radial glow, centered buttons",
  "theme.desc.nodeseek":
    "Tech-forum rows — cool-gray grid, solid cards, teal accent bar on every link, CJK fonts",
  "theme.desc.qtcool":
    "Neo-brutal stickers — cream grid, 3px ink, hard 5–8px offset shadow, yellow/orange pops",
  "theme.desc.liquid-glass":
    "Liquid glass — high blur, translucent panels, top highlights, cool cyan-blue, fluid hover",
  "theme.desc.xandroid":
    "X Android rewrite vibe: solid white/black, neutral gray, #1D9BF0 accent only, ~14px radius, timeline link rows",
  "theme.desc.md3":
    "Material 3 baseline — purple #6750A4, tonal surfaces, Roboto, 12/16/24 shape, filled first CTA",
  "theme.desc.miuix":
    "HyperOS / Miuix — exclusive #3482FF, large squircle, dense clean surfaces, soft blue elevation",
  "theme.desc.rin":
    "openRin/Rin default UI — rose #FC466B, clean #f5f5f5/#1c1c1e surfaces, soft shadows, edge-native blog",
};

const zhCN: Dict = {
  "public.emptyLinks": "暂无链接",
  "public.metaDescription": "{siteName} — 个人主页链接",
  "public.linksNav": "链接",
  "public.footer.site": "{siteName}",
  "public.toolbar.color": "颜色模式",
  "public.toolbar.color.system": "跟随系统",
  "public.toolbar.color.light": "浅色",
  "public.toolbar.color.dark": "深色",
  "public.toolbar.locale": "语言",
  "public.toolbar.locale.auto": "自动",
  "public.toolbar.locale.zh": "中文",
  "public.toolbar.locale.en": "English",

  "admin.brand": "LinkBio",
  "admin.subtitle": "管理你的个人主页内容与外观。",
  "admin.nav.overview": "概览",
  "admin.nav.profile": "资料",
  "admin.nav.links": "链接",
  "admin.nav.theme": "主题",
  "admin.nav.data": "数据",
  "admin.nav.public": "前台",
  "admin.nav.console": "管理",
  "admin.nav.homeTitle": "打开前台（{siteName}）",
  "admin.nav.logout": "退出",
  "admin.page.overview": "控制台",
  "admin.page.profile": "资料",
  "admin.page.links": "链接",
  "admin.page.theme": "主题",
  "admin.page.data": "数据",
  "admin.stats.empty": "—",
  "admin.links.urlPlaceholder": "https://",
  "admin.links.moveUp": "上移",
  "admin.links.moveDown": "下移",
  "admin.theme.defaultThemeHint": "站点默认：{default} · 当前：{current}",
  "admin.theme.accentPlaceholder": "#FC466B",
  "admin.theme.backgroundPlaceholder": "https://…",
  "admin.backup.secretPlaceholder": "••••••••",
  "admin.login.title": "管理后台",
  "admin.login.heading": "管理员登录",
  "admin.login.sub": "登录以管理 {siteName}",
  "admin.login.password": "密码",
  "admin.login.hint": "使用 ADMIN_PASSWORD 密钥，不会存入 KV。",
  "admin.login.submit": "登录",
  "admin.login.error.csrf": "CSRF 校验失败，请刷新后重试。",
  "admin.login.error.password": "密码错误。",
  "admin.login.error.rateLimit": "登录失败次数过多，请约 {minutes} 分钟后再试。",
  "admin.login.error.noPassword": "未配置 ADMIN_PASSWORD 密钥。",
  "admin.login.error.noSessionSecret": "未配置 SESSION_SECRET 密钥。",

  "admin.overview.quickLinks": "快捷入口",
  "admin.overview.editProfile": "编辑资料",
  "admin.overview.manageLinks": "管理链接",
  "admin.overview.theme": "主题",
  "admin.overview.data": "导入 / 导出",
  "admin.overview.viewPublic": "查看前台",
  "admin.overview.currentProfile": "当前资料",
  "admin.overview.enabledLinks": "已启用 {count} 个链接",

  "admin.stats.title": "数据统计",
  "admin.stats.hint":
    "计数使用拆分 KV 键并带短重试。并发访问下为最终一致，可能略少计。",
  "admin.stats.pageViews": "页面浏览",
  "admin.stats.linkClicks": "链接点击",
  "admin.stats.lastUpdated": "最近更新",

  "admin.profile.title": "资料",
  "admin.profile.name": "名称",
  "admin.profile.username": "用户名",
  "admin.profile.bio": "简介",
  "admin.profile.avatar": "头像 URL",
  "admin.profile.location": "位置",
  "admin.profile.email": "邮箱",
  "admin.profile.save": "保存资料",
  "admin.profile.saved": "资料已保存。",

  "admin.links.title": "链接",
  "admin.links.empty": "暂无链接，请在下方添加。",
  "admin.links.add": "添加链接",
  "admin.links.fieldTitle": "标题",
  "admin.links.icon": "图标",
  "admin.links.icon.custom": "{id}（自定义）",
  "admin.links.url": "链接地址",
  "admin.links.enabled": "启用",
  "admin.links.submit": "添加链接",
  "admin.links.enable": "启用",
  "admin.links.disable": "禁用",
  "admin.links.delete": "删除",
  "admin.links.deleteConfirm": "确定删除此链接？",
  "admin.links.badgeOn": "开",
  "admin.links.badgeOff": "关",
  "admin.links.meta": "{url} · 图标: {icon} · 排序: {order}",
  "admin.links.added": "链接已添加。",
  "admin.links.deleted": "链接已删除。",
  "admin.links.updated": "链接已更新。",
  "admin.links.reordered": "顺序已更新。",
  "admin.links.invalidUrl": "无效 URL，仅支持 http(s)。",
  "admin.links.edit": "编辑",
  "admin.links.saveEdit": "保存修改",
  "admin.links.savedEdit": "链接已保存。",
  "admin.links.cancelEdit": "取消",
  "admin.links.notFound": "未找到该链接。",

  "admin.theme.title": "主题与外观",
  "admin.theme.theme": "主题风格",
  "admin.theme.themeDefault": "默认",
  "admin.theme.themeMinimal": "极简",
  "admin.theme.themeGlass": "玻璃",
  "admin.theme.accent": "强调色",
  "admin.theme.background": "背景图 URL（可选）",
  "admin.theme.colorMode": "深浅色",
  "admin.theme.colorMode.system": "自动（跟随系统）",
  "admin.theme.colorMode.light": "浅色",
  "admin.theme.colorMode.dark": "深色",
  "admin.theme.locale": "语言",
  "admin.theme.locale.zhCN": "中文 (zh-CN)",
  "admin.theme.locale.en": "English",
  "admin.theme.footerTitle": "前台页脚",
  "admin.theme.footerHint": "自定义文案为空时显示站点名称。仅登录后显示：仅管理员会话可见。",
  "admin.theme.showFooter": "显示页脚",
  "admin.theme.footerMode": "页脚模式",
  "admin.theme.footerMode.default": "默认（站点名称）",
  "admin.theme.footerMode.custom": "仅自定义文案",
  "admin.theme.footerMode.auth_only": "仅管理员登录后显示",
  "admin.theme.footerMode.off": "始终隐藏",
  "admin.theme.footerText": "自定义页脚文案（可选）",
  "admin.theme.footerTextHint": "纯文本；换行会保留。HTML 会被转义。",
  "admin.theme.footerTextPlaceholder": "留空则显示站点名称",
  "admin.theme.save": "保存主题",
  "admin.theme.saved": "主题已保存。",

  "admin.data.title": "数据 · 导入 / 导出",
  "admin.data.hint":
    "导出 JSON 含资料、链接、设置、统计与可选备份配置；绝不包含 ADMIN_PASSWORD / SESSION_SECRET。导入会覆盖对应键。",
  "admin.data.export": "导出 JSON",
  "admin.data.importLabel": "导入 JSON",
  "admin.data.import": "导入",
  "admin.data.importPlaceholder":
    '{"version":1,"profile":{...},"links":[...],"settings":{...},"backup":{...}}',
  "admin.data.imported": "导入成功。",
  "admin.data.invalidJson": "JSON 无效。",

  "admin.backup.title": "远端备份（可选）",
  "admin.backup.hint":
    "WebDAV 与 Gist 可同时开启，推送并行执行。凭据以你填写的明文存入 KV（非环境密钥）。自动备份在资料/链接/设置保存后触发（统计递增不触发）。备份失败不会阻断业务保存。",
  "admin.backup.autoBackup": "内容保存后自动备份",
  "admin.backup.includeAnalytics": "远端备份包含统计数据",
  "admin.backup.minInterval": "自动备份最小间隔（秒）",
  "admin.backup.minIntervalHint": "最小 60 秒。立即备份不受此限制。",
  "admin.backup.webdav": "WebDAV",
  "admin.backup.webdavEnable": "启用 WebDAV",
  "admin.backup.webdavUrl": "文件 URL",
  "admin.backup.webdavUrlPlaceholder": "https://dav.example.com/.../linkbio.json",
  "admin.backup.webdavUser": "用户名",
  "admin.backup.webdavPass": "密码 / 应用专用密码",
  "admin.backup.gist": "GitHub Gist",
  "admin.backup.gistEnable": "启用 Gist",
  "admin.backup.gistToken": "Personal Access Token（需 gist 权限）",
  "admin.backup.gistTokenPlaceholder": "ghp_…",
  "admin.backup.gistId": "Gist ID",
  "admin.backup.gistIdHint": "留空则在首次成功备份时创建私有 Gist 并写回。",
  "admin.backup.gistFilename": "Gist 内文件名",
  "admin.backup.secretKeep": "留空表示保留已保存的值。",
  "admin.backup.saveConfig": "保存备份设置",
  "admin.backup.configSaved": "备份设置已保存。",
  "admin.backup.runNow": "立即备份",
  "admin.backup.runOk": "备份完成。",
  "admin.backup.runOkPartial": "备份完成（部分警告）：{details}",
  "admin.backup.runFail": "备份失败。",
  "admin.backup.restoreWebdav": "从 WebDAV 恢复",
  "admin.backup.restoreGist": "从 Gist 恢复",
  "admin.backup.restoreOk": "已从远端恢复。",
  "admin.backup.restoreFail": "恢复失败。",
  "admin.backup.restoreWarn": "恢复会覆盖资料 / 链接 / 设置（若文件中含统计或备份配置也会覆盖）。",
  "admin.backup.statusNone": "尚未执行过远端备份。",
  "admin.backup.statusOk": "上次：成功",
  "admin.backup.statusFail": "上次：失败",
  "admin.backup.source": "来源",
  "admin.backup.source.manual": "手动",
  "admin.backup.source.auto": "自动",
  "admin.backup.targets": "目标",
  "admin.backup.target.webdav": "WebDAV",
  "admin.backup.target.gist": "Gist",
  "admin.backup.lastSuccess": "上次成功",
  "admin.backup.lastAttempt": "上次尝试",
  "admin.backup.lastError": "错误",
  "admin.backup.err.webdavUrlEmpty": "WebDAV URL 为空。",
  "admin.backup.err.webdavAuthRequired":
    "WebDAV 返回 401 — 请填写用户名和密码（或应用专用密码）。",
  "admin.backup.err.webdavHttp": "WebDAV HTTP {status}{detail}",
  "admin.backup.err.webdavFailed": "WebDAV 请求失败。",
  "admin.backup.err.webdavFetchFailed": "WebDAV 下载失败。",
  "admin.backup.err.gistTokenEmpty": "Gist Token 为空。",
  "admin.backup.err.gistIdEmpty": "Gist ID 为空。",
  "admin.backup.err.gistHttp": "Gist HTTP {status}{detail}",
  "admin.backup.err.gistCreateHttp": "创建 Gist HTTP {status}{detail}",
  "admin.backup.err.gistCreateNoId": "创建 Gist 失败：未返回 ID。",
  "admin.backup.err.gistFailed": "Gist 请求失败。",
  "admin.backup.err.gistNoFiles": "Gist 中没有文件。",
  "admin.backup.err.gistRawHttp": "Gist 原始文件 HTTP {status}",
  "admin.backup.err.gistContentUnavailable": "无法读取 Gist 文件内容。",
  "admin.backup.err.gistFetchFailed": "Gist 下载失败。",
  "admin.backup.err.noTarget": "未启用任何备份目标。",
  "admin.backup.err.backupFailed": "备份失败。",
  "admin.backup.err.invalidJson": "备份 JSON 无效。",
  "admin.backup.err.applyFailed": "应用备份失败。",
  "admin.backup.err.network": "网络错误：{message}",
  "admin.backup.err.partial": "部分成功：{details}",

  "admin.error.csrf": "CSRF 校验失败，请刷新后重试。",

  "theme.desc.aurora": "极光默认：冷青–靛紫、多层径向极光、梦幻阴影",
  "theme.desc.base": "极光默认：冷青–靛紫、多层径向极光、梦幻阴影",
  "theme.desc.minimal": "极致极简：近直角、无阴影无描边、单色墨、紧凑间距",
  "theme.desc.apple": "Apple 营销页：实色冷灰 tile、SF、胶囊 CTA、首链主色蓝",
  "theme.desc.anthropic": "编辑纸质感：燕麦页、象牙便签、黏土强调、衬线、厚描边无阴影",
  "theme.desc.hono-old": "Linear/Vercel 暗色：近纯黑、锐利 indigo、强径向光晕、居中按钮",
  "theme.desc.nodeseek": "技术论坛行：冷灰网格、实色卡、每行左侧青绿 accent bar、中文字体",
  "theme.desc.qtcool": "新粗野贴纸：奶油网格、3px 描边、硬偏移 5–8px、黄橙点缀",
  "theme.desc.liquid-glass": "液态玻璃：高 blur、半透明面板、顶高光、冷青蓝、液面 hover",
  "theme.desc.xandroid":
    "X Android 重写气质：实色白/纯黑、中性灰、#1D9BF0 仅强调、约 14px 圆角、时间线链接列表",
  "theme.desc.md3": "Material 3：紫 #6750A4、tonal 表面、Roboto、12/16/24、首链 filled",
  "theme.desc.miuix": "HyperOS：独占 #3482FF、大 squircle、高密度干净表面、蓝调软 elevation",
  "theme.desc.rin":
    "openRin/Rin 默认 UI：活力玫瑰 #FC466B、浅灰/深灰表面、轻阴影、现代 Edge 博客气质",
};

const catalogs: Record<Locale, Dict> = {
  en,
  "zh-CN": zhCN,
};

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Lightweight i18n (no external deps).
 * Missing keys fall back to en, then the key itself.
 */
export function createT(locale: Locale | string | undefined): TranslateFn {
  const lang: Locale = locale === "en" || locale === "zh-CN" ? locale : "zh-CN";
  const primary = catalogs[lang] || zhCN;
  const fallback = en;

  return (key: string, vars?: Record<string, string | number>) => {
    let template = primary[key] ?? fallback[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        template = template.split(`{${k}}`).join(String(v));
      }
    }
    return template;
  };
}

export function htmlLang(locale: Locale | string | undefined): string {
  return locale === "en" ? "en" : "zh-CN";
}

/**
 * Localized theme pack description for admin UI.
 * Falls back to manifest `description` when no i18n key exists (new themes).
 */
export function themeDescription(
  t: TranslateFn,
  themeId: string,
  fallback = "",
): string {
  const key = `theme.desc.${themeId}`;
  const value = t(key);
  if (value && value !== key) return value;
  return fallback;
}

/**
 * Map Accept-Language to supported locales.
 * Any `zh*` tag → zh-CN; otherwise first matching en; else null.
 */
export function localeFromAcceptLanguage(header: string | undefined): Locale | null {
  if (!header) return null;
  const parts = header.split(",").map((p) => {
    const [tag, ...params] = p.trim().split(";");
    let q = 1;
    for (const param of params) {
      const m = param.trim().match(/^q=([0-9.]+)$/i);
      if (m) q = Number(m[1]) || 0;
    }
    return { tag: (tag || "").toLowerCase(), q };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    if (!tag) continue;
    if (tag === "zh" || tag.startsWith("zh-")) return "zh-CN";
  }
  for (const { tag } of parts) {
    if (!tag) continue;
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return null;
}

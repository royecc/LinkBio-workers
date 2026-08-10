import { redirect } from "next/navigation";
import { Button, LinkButton } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { InputArea } from "@cloudflare/kumo/components/input";
import {
  importDataAction,
  restoreGistAction,
  restoreWebDavAction,
  runBackupNowAction,
  saveBackupConfigAction,
} from "../actions";
import { AdminNav } from "@/components/admin/nav";
import { Flash } from "@/components/admin/flash";
import { AdminPanel } from "@/components/admin/panel";
import { isAdminSession } from "@/lib/auth";
import { getAdminUi } from "@/lib/admin-ui";
import {
  translateBackupError,
  translateBackupSource,
  translateBackupTarget,
} from "@/lib/backup-i18n";
import { getCsrfToken } from "@/lib/csrf";
import { resolveAdminFlash } from "@/lib/flash";
import { CSRF_FIELD } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { store, siteName, t } = await getAdminUi();
  const [backup, state] = await Promise.all([store.getBackupConfig(), store.getBackupState()]);
  const csrf = await getCsrfToken();
  const sp = await searchParams;
  const flash = await resolveAdminFlash(sp.msg);

  const statusLine = state.lastAttemptAt
    ? [
        state.lastOk ? t("admin.backup.statusOk") : t("admin.backup.statusFail"),
        state.lastSource
          ? `${t("admin.backup.source")}: ${translateBackupSource(t, state.lastSource)}`
          : "",
        state.lastTargets.length
          ? `${t("admin.backup.targets")}: ${state.lastTargets
              .map((x) => translateBackupTarget(t, x))
              .join(", ")}`
          : "",
        state.lastSuccessAt
          ? `${t("admin.backup.lastSuccess")}: ${state.lastSuccessAt}`
          : "",
        state.lastAttemptAt
          ? `${t("admin.backup.lastAttempt")}: ${state.lastAttemptAt}`
          : "",
        state.lastError
          ? `${t("admin.backup.lastError")}: ${translateBackupError(t, state.lastError)}`
          : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : t("admin.backup.statusNone");

  return (
    <div className="admin-shell">
      <AdminNav active="data" siteName={siteName} csrf={csrf} t={t} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-kumo-strong">
          {t("admin.page.data")}
        </h1>
        <p className="text-sm text-kumo-subtle">{t("admin.subtitle")}</p>
      </header>

      <AdminPanel title={t("admin.data.title")} className="mb-6">
        <div className="space-y-4">
          <Flash message={flash} />
          <p className="text-sm text-kumo-subtle">{t("admin.data.hint")}</p>
          <LinkButton href="/api/admin/export" variant="secondary">
            {t("admin.data.export")}
          </LinkButton>
          <form action={importDataAction} className="space-y-3">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <InputArea
              id="json"
              name="json"
              label={t("admin.data.importLabel")}
              required
              rows={8}
              className="font-mono text-xs"
              placeholder={t("admin.data.importPlaceholder")}
            />
            <Button type="submit" variant="primary">
              {t("admin.data.import")}
            </Button>
          </form>
        </div>
      </AdminPanel>

      <AdminPanel title={t("admin.backup.title")} className="mb-6">
        <div className="space-y-4">
          <p className="text-sm text-kumo-subtle">{t("admin.backup.hint")}</p>
          <p className="rounded-lg border border-kumo-hairline bg-kumo-tint px-3 py-2 text-xs text-kumo-default">
            {statusLine}
          </p>

          <form action={saveBackupConfigAction} className="space-y-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-kumo-default">
                <input
                  type="checkbox"
                  name="autoBackup"
                  value="1"
                  defaultChecked={backup.autoBackup}
                  className="size-4"
                />
                {t("admin.backup.autoBackup")}
              </label>
              <label className="flex items-center gap-2 text-sm text-kumo-default">
                <input
                  type="checkbox"
                  name="includeAnalytics"
                  value="1"
                  defaultChecked={backup.includeAnalytics}
                  className="size-4"
                />
                {t("admin.backup.includeAnalytics")}
              </label>
              <Input
                id="minIntervalSec"
                name="minIntervalSec"
                type="number"
                label={t("admin.backup.minInterval")}
                defaultValue={String(backup.minIntervalSec)}
                min={60}
                max={604800}
                description={t("admin.backup.minIntervalHint")}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-kumo-hairline p-4">
              <h3 className="text-sm font-semibold text-kumo-strong">{t("admin.backup.webdav")}</h3>
              <label className="flex items-center gap-2 text-sm text-kumo-default">
                <input
                  type="checkbox"
                  name="webdavEnabled"
                  value="1"
                  defaultChecked={backup.webdav.enabled}
                  className="size-4"
                />
                {t("admin.backup.webdavEnable")}
              </label>
              <Input
                id="webdavUrl"
                name="webdavUrl"
                type="url"
                label={t("admin.backup.webdavUrl")}
                defaultValue={backup.webdav.url}
                placeholder={t("admin.backup.webdavUrlPlaceholder")}
                required={false}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  id="webdavUsername"
                  name="webdavUsername"
                  label={t("admin.backup.webdavUser")}
                  defaultValue={backup.webdav.username}
                  required={false}
                  autoComplete="off"
                />
                <Input
                  id="webdavPassword"
                  name="webdavPassword"
                  type="password"
                  label={t("admin.backup.webdavPass")}
                  placeholder={
                    backup.webdav.password ? t("admin.backup.secretPlaceholder") : ""
                  }
                  description={t("admin.backup.secretKeep")}
                  required={false}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-kumo-hairline p-4">
              <h3 className="text-sm font-semibold text-kumo-strong">{t("admin.backup.gist")}</h3>
              <label className="flex items-center gap-2 text-sm text-kumo-default">
                <input
                  type="checkbox"
                  name="gistEnabled"
                  value="1"
                  defaultChecked={backup.gist.enabled}
                  className="size-4"
                />
                {t("admin.backup.gistEnable")}
              </label>
              <Input
                id="gistToken"
                name="gistToken"
                type="password"
                label={t("admin.backup.gistToken")}
                placeholder={
                  backup.gist.token
                    ? t("admin.backup.secretPlaceholder")
                    : t("admin.backup.gistTokenPlaceholder")
                }
                description={t("admin.backup.secretKeep")}
                required={false}
                autoComplete="new-password"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  id="gistId"
                  name="gistId"
                  label={t("admin.backup.gistId")}
                  defaultValue={backup.gist.gistId}
                  description={t("admin.backup.gistIdHint")}
                  required={false}
                />
                <Input
                  id="gistFilename"
                  name="gistFilename"
                  label={t("admin.backup.gistFilename")}
                  defaultValue={backup.gist.filename}
                  required={false}
                />
              </div>
            </div>

            <Button type="submit" variant="primary">
              {t("admin.backup.saveConfig")}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 border-t border-kumo-hairline pt-4">
            <form action={runBackupNowAction}>
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <Button type="submit" variant="secondary">
                {t("admin.backup.runNow")}
              </Button>
            </form>
            <form action={restoreWebDavAction}>
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <Button type="submit" variant="secondary">
                {t("admin.backup.restoreWebdav")}
              </Button>
            </form>
            <form action={restoreGistAction}>
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <Button type="submit" variant="secondary">
                {t("admin.backup.restoreGist")}
              </Button>
            </form>
          </div>
          <p className="text-xs text-kumo-subtle">{t("admin.backup.restoreWarn")}</p>
        </div>
      </AdminPanel>
    </div>
  );
}

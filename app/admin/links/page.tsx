import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@cloudflare/kumo/components/badge";
import { Button, LinkButton } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import {
  addLinkAction,
  deleteLinkAction,
  reorderLinkAction,
  toggleLinkAction,
  updateLinkAction,
} from "../actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit";
import { AdminNav } from "@/components/admin/nav";
import { Flash } from "@/components/admin/flash";
import { IconSelect } from "@/components/admin/icon-select";
import { AdminPanel } from "@/components/admin/panel";
import { isAdminSession } from "@/lib/auth";
import { getAdminUi } from "@/lib/admin-ui";
import { getCsrfToken } from "@/lib/csrf";
import { resolveAdminFlash } from "@/lib/flash";
import { resolveLinkIconSrc } from "@/lib/icons";
import { CSRF_FIELD } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; edit?: string }>;
}) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { store, siteName, t } = await getAdminUi();
  const links = await store.getLinks();
  const csrf = await getCsrfToken();
  const sp = await searchParams;
  const flash = await resolveAdminFlash(sp.msg);
  const editId = (sp.edit || "").trim();
  const sorted = [...links].sort((a, b) => a.order - b.order);
  const editing = editId ? sorted.find((l) => l.id === editId) : undefined;

  return (
    <div className="admin-shell">
      <AdminNav active="links" siteName={siteName} csrf={csrf} t={t} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-kumo-strong">
          {t("admin.page.links")}
        </h1>
        <p className="text-sm text-kumo-subtle">{t("admin.subtitle")}</p>
      </header>
      <AdminPanel title={t("admin.links.title")} className="mb-6">
          <div className="space-y-3">
            <Flash message={flash} />
            {sorted.length === 0 ? (
              <p className="text-sm text-kumo-subtle">{t("admin.links.empty")}</p>
            ) : (
              sorted.map((l) => {
                const isEditing = editing?.id === l.id;
                const iconSrc = resolveLinkIconSrc(l.icon);
                return (
                  <div
                    key={l.id}
                    className="rounded-xl border border-kumo-hairline bg-kumo-base p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-0.5 inline-block size-8 shrink-0 rounded-md border border-kumo-hairline bg-kumo-control"
                          style={{
                            maskImage: `url(${iconSrc})`,
                            WebkitMaskImage: `url(${iconSrc})`,
                            maskSize: "1.25rem",
                            WebkitMaskSize: "1.25rem",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            backgroundColor: "var(--text-color-kumo-default, currentColor)",
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-medium text-kumo-default">
                            <span className="truncate">{l.title}</span>
                            <Badge variant={l.enabled ? "success" : "neutral"}>
                              {l.enabled ? t("admin.links.badgeOn") : t("admin.links.badgeOff")}
                            </Badge>
                          </div>
                          <p className="truncate text-xs text-kumo-subtle">
                            {t("admin.links.meta", {
                              url: l.url,
                              icon: l.icon,
                              order: l.order,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {isEditing ? (
                          <LinkButton href="/admin/links" variant="secondary" size="sm">
                            {t("admin.links.cancelEdit")}
                          </LinkButton>
                        ) : (
                          <LinkButton
                            href={`/admin/links?edit=${encodeURIComponent(l.id)}`}
                            variant="secondary"
                            size="sm"
                          >
                            {t("admin.links.edit")}
                          </LinkButton>
                        )}
                        <form action={toggleLinkAction}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="id" value={l.id} />
                          <Button type="submit" size="sm" variant="secondary">
                            {l.enabled ? t("admin.links.disable") : t("admin.links.enable")}
                          </Button>
                        </form>
                        <form action={reorderLinkAction}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="id" value={l.id} />
                          <input type="hidden" name="dir" value={-1} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            aria-label={t("admin.links.moveUp")}
                            title={t("admin.links.moveUp")}
                          >
                            ↑
                          </Button>
                        </form>
                        <form action={reorderLinkAction}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="id" value={l.id} />
                          <input type="hidden" name="dir" value={1} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="secondary"
                            aria-label={t("admin.links.moveDown")}
                            title={t("admin.links.moveDown")}
                          >
                            ↓
                          </Button>
                        </form>
                        <form action={deleteLinkAction}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="id" value={l.id} />
                          <ConfirmSubmitButton
                            size="sm"
                            variant="destructive"
                            confirmMessage={t("admin.links.deleteConfirm")}
                          >
                            {t("admin.links.delete")}
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>

                    {isEditing ? (
                      <form
                        action={updateLinkAction}
                        className="mt-4 space-y-4 border-t border-kumo-hairline pt-4"
                      >
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="id" value={l.id} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            id={`edit-title-${l.id}`}
                            name="title"
                            label={t("admin.links.fieldTitle")}
                            defaultValue={l.title}
                            required
                            maxLength={80}
                          />
                          <IconSelect
                            id={`edit-icon-${l.id}`}
                            name="icon"
                            label={t("admin.links.icon")}
                            defaultValue={l.icon}
                            customLabelTemplate={t("admin.links.icon.custom")}
                          />
                        </div>
                        <Input
                          id={`edit-url-${l.id}`}
                          name="url"
                          type="url"
                          label={t("admin.links.url")}
                          defaultValue={l.url}
                          required
                          maxLength={2000}
                          placeholder={t("admin.links.urlPlaceholder")}
                        />
                        <label className="flex items-center gap-2 text-sm text-kumo-default">
                          <input
                            type="checkbox"
                            name="enabled"
                            value="1"
                            defaultChecked={l.enabled}
                            className="size-4"
                          />
                          {t("admin.links.enabled")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" variant="primary" size="sm">
                            {t("admin.links.saveEdit")}
                          </Button>
                          <LinkButton href="/admin/links" variant="secondary" size="sm">
                            {t("admin.links.cancelEdit")}
                          </LinkButton>
                        </div>
                      </form>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
      </AdminPanel>

      {editId && !editing ? (
        <p className="mb-4 text-sm text-kumo-subtle">
          {t("admin.links.notFound")}{" "}
          <Link href="/admin/links" className="text-kumo-link underline">
            {t("admin.links.cancelEdit")}
          </Link>
        </p>
      ) : null}

      <AdminPanel title={t("admin.links.add")}>
          <form action={addLinkAction} className="space-y-4">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="title"
                name="title"
                label={t("admin.links.fieldTitle")}
                required
                maxLength={80}
              />
              <IconSelect
                id="icon"
                name="icon"
                label={t("admin.links.icon")}
                defaultValue="link"
                customLabelTemplate={t("admin.links.icon.custom")}
              />
            </div>
            <Input
              id="url"
              name="url"
              type="url"
              label={t("admin.links.url")}
              required
              maxLength={2000}
              placeholder={t("admin.links.urlPlaceholder")}
            />
            <label className="flex items-center gap-2 text-sm text-kumo-default">
              <input type="checkbox" name="enabled" value="1" defaultChecked className="size-4" />
              {t("admin.links.enabled")}
            </label>
            <div className="border-t border-kumo-hairline pt-4">
              <Button type="submit" variant="primary">
                {t("admin.links.submit")}
              </Button>
            </div>
          </form>
      </AdminPanel>
    </div>
  );
}

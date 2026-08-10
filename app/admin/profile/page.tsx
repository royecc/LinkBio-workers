import { redirect } from "next/navigation";
import { Button } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { InputArea } from "@cloudflare/kumo/components/input";
import { saveProfileAction } from "../actions";
import { AdminNav } from "@/components/admin/nav";
import { Flash } from "@/components/admin/flash";
import { AdminPanel } from "@/components/admin/panel";
import { isAdminSession } from "@/lib/auth";
import { getAdminUi } from "@/lib/admin-ui";
import { getCsrfToken } from "@/lib/csrf";
import { resolveAdminFlash } from "@/lib/flash";
import { CSRF_FIELD } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { store, siteName, t } = await getAdminUi();
  const profile = await store.getProfile();
  const csrf = await getCsrfToken();
  const sp = await searchParams;
  const flash = await resolveAdminFlash(sp.msg);

  return (
    <div className="admin-shell">
      <AdminNav active="profile" siteName={siteName} csrf={csrf} t={t} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-kumo-strong">
          {t("admin.page.profile")}
        </h1>
        <p className="text-sm text-kumo-subtle">{t("admin.subtitle")}</p>
      </header>
      <AdminPanel title={t("admin.profile.title")}>
        <Flash message={flash} />
        <form action={saveProfileAction} className="space-y-4">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="name"
              name="name"
              label={t("admin.profile.name")}
              defaultValue={profile.name}
              required
              maxLength={80}
            />
            <Input
              id="username"
              name="username"
              label={t("admin.profile.username")}
              defaultValue={profile.username}
              maxLength={40}
              required={false}
            />
          </div>
          <InputArea
            id="bio"
            name="bio"
            label={t("admin.profile.bio")}
            defaultValue={profile.bio}
            maxLength={500}
            rows={4}
            required={false}
          />
          <Input
            id="avatar"
            name="avatar"
            type="url"
            label={t("admin.profile.avatar")}
            defaultValue={profile.avatar}
            maxLength={2000}
            required={false}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="location"
              name="location"
              label={t("admin.profile.location")}
              defaultValue={profile.location}
              maxLength={120}
              required={false}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label={t("admin.profile.email")}
              defaultValue={profile.email}
              maxLength={120}
              required={false}
            />
          </div>
          <Button type="submit" variant="primary">
            {t("admin.profile.save")}
          </Button>
        </form>
      </AdminPanel>
    </div>
  );
}

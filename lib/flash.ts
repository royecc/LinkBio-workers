import { cookies, headers } from "next/headers";
import { FLASH_COOKIE } from "@/lib/flash-constants";
import { isSecureRequestFromHeaders } from "@/lib/security";

export { FLASH_COOKIE };

export function flashOk(msg: string) {
  return `ok:${msg}`;
}

export function flashErr(msg: string) {
  return `error:${msg}`;
}

export async function setFlashCookie(value: string) {
  const jar = await cookies();
  const h = await headers();
  jar.set(FLASH_COOKIE, value, {
    path: "/admin",
    maxAge: 60,
    sameSite: "lax",
    secure: isSecureRequestFromHeaders(h),
    httpOnly: false,
  });
}

/** Read flash for the current request (does not clear; client clears after paint). */
export async function readFlashCookie(): Promise<string | undefined> {
  const jar = await cookies();
  const v = jar.get(FLASH_COOKIE)?.value?.trim();
  return v || undefined;
}

/**
 * Prefer cookie flash; fall back to legacy `?msg=` for old bookmarks.
 */
export async function resolveAdminFlash(queryMsg?: string | null): Promise<string | undefined> {
  const fromCookie = await readFlashCookie();
  if (fromCookie) return fromCookie;
  const q = queryMsg?.trim();
  return q || undefined;
}

import { cookies, headers } from "next/headers";
import { CSRF_COOKIE, CSRF_HEADER, generateCsrfToken } from "@/lib/security";

/**
 * Read CSRF token for admin forms (RSC-safe: never cookies().set).
 * Prefer request cookie; fall back to middleware-forwarded header (first visit).
 */
export async function getCsrfToken(): Promise<string> {
  const jar = await cookies();
  const fromCookie = jar.get(CSRF_COOKIE)?.value;
  if (fromCookie && fromCookie.length >= 16) return fromCookie;

  const h = await headers();
  const fromHeader = h.get(CSRF_HEADER);
  if (fromHeader && fromHeader.length >= 16) return fromHeader;

  // Should be rare (middleware matcher miss). Form may fail CSRF until refresh.
  return generateCsrfToken();
}

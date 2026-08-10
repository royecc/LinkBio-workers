import { createMiddleware } from "hono/factory";

/**
 * Security headers for all responses.
 */
export const securityHeaders = createMiddleware(async (c, next) => {
  await next();
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CSP: SSR app with inline styles for theme variables; no third-party scripts.
  c.res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
});

/**
 * Escape text for HTML text nodes / attributes.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Simple CSRF: double-submit cookie + form field.
 * Token is bound to session secret material via HMAC in session layer;
 * here we use a random token stored in cookie.
 */
export const CSRF_COOKIE = "lb_csrf";
export const CSRF_FIELD = "_csrf";

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i]!.toString(16).padStart(2, "0");
  return s;
}

export function buildCsrfCookie(token: string, secure: boolean): string {
  const parts = [`${CSRF_COOKIE}=${token}`, "Path=/", "SameSite=Lax", "Max-Age=86400"];
  if (secure) parts.push("Secure");
  // Readable by JS is NOT required (double-submit via cookie + form). Keep not HttpOnly
  // so we could also use header pattern later; form posts read from hidden field only.
  return parts.join("; ");
}

export function parseCsrfFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === CSRF_COOKIE) return rest.join("=") || null;
  }
  return null;
}

export function validateCsrf(cookieToken: string | null, formToken: string | null | undefined): boolean {
  if (!cookieToken || !formToken) return false;
  if (cookieToken.length < 16 || formToken.length < 16) return false;
  if (cookieToken.length !== formToken.length) return false;
  let out = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    out |= cookieToken.charCodeAt(i) ^ formToken.charCodeAt(i);
  }
  return out === 0;
}

export function isSecureRequest(c: { req: { url: string; header: (n: string) => string | undefined } }): boolean {
  try {
    const url = new URL(c.req.url);
    if (url.protocol === "https:") return true;
  } catch {
    /* ignore */
  }
  const proto = c.req.header("X-Forwarded-Proto");
  return proto === "https";
}

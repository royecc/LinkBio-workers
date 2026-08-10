import type { SessionPayload } from "./types";

const COOKIE_NAME = "lb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Stateless signed sessions using HMAC-SHA256.
 * Format: base64url(payload).base64url(signature)
 * Password is never stored in KV; only ADMIN_PASSWORD + SESSION_SECRET are used.
 */
export async function createSessionToken(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = await sign(body, secret);
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!body || !sig) return false;

  const expected = await sign(body, secret);
  if (!timingSafeEqual(sig, expected)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (payload.sub !== "admin") return false;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function buildSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie(secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const cookies = header.split(";");
  for (const part of cookies) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

async function sign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64UrlEncodeBytes(new Uint8Array(sig));
}

function base64UrlEncode(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // still run a compare to reduce timing variance on length leak paths
    await crypto.subtle.digest("SHA-256", ab);
    return false;
  }
  let out = 0;
  for (let i = 0; i < ab.length; i++) out |= ab[i]! ^ bb[i]!;
  return out === 0;
}

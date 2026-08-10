import { createMiddleware } from "hono/factory";
import {
  getSessionCookieName,
  parseCookie,
  verifySessionToken,
} from "../services/session";

export type AuthVariables = {
  isAdmin: boolean;
};

/**
 * Attaches isAdmin to context. Does not reject — use requireAdmin for that.
 */
export const attachAuth = createMiddleware<{
  Bindings: Env;
  Variables: AuthVariables;
}>(async (c, next) => {
  const secret = c.env.SESSION_SECRET || "";
  const cookie = parseCookie(c.req.header("Cookie"), getSessionCookieName());
  const ok = await verifySessionToken(cookie, secret);
  c.set("isAdmin", ok);
  await next();
});

/**
 * Requires a valid admin session. Redirects HTML navigations to login;
 * returns 401 JSON for API requests.
 */
export const requireAdmin = createMiddleware<{
  Bindings: Env;
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!c.get("isAdmin")) {
    const accept = c.req.header("Accept") || "";
    const isApi =
      c.req.path.startsWith("/api/") ||
      accept.includes("application/json") ||
      c.req.header("X-Requested-With") === "XMLHttpRequest";

    if (isApi) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const nextUrl = encodeURIComponent(c.req.path + (c.req.url.includes("?") ? `?${c.req.url.split("?")[1]}` : ""));
    return c.redirect(`/admin/login?next=${nextUrl}`);
  }
  await next();
});

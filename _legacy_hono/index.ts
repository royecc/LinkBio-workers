import { Hono } from "hono";
import { attachAuth, type AuthVariables } from "./middleware/auth";
import { securityHeaders } from "./middleware/security";
import { admin } from "./routes/admin";
import { api } from "./routes/api";
import { publicRoutes } from "./routes/public";

/**
 * LinkBio-workers — Cloudflare Workers entrypoint
 *
 * Architecture:
 *   Browser → Worker (Hono) → KV (BIO_KV) → HTML SSR / JSON API
 */
const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

app.use("*", securityHeaders);
app.use("*", attachAuth);

app.route("/", publicRoutes);
app.route("/api", api);
app.route("/admin", admin);

app.notFound((c) => {
  const accept = c.req.header("Accept") || "";
  if (accept.includes("application/json")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Not found</title>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0a0a0b;color:#fafafa}
    a{color:#818cf8}</style></head><body><div style="text-align:center"><h1 style="letter-spacing:-.03em">404</h1><p style="color:#a1a1aa">Page not found.</p><p><a href="/">Home</a></p></div></body></html>`,
    404,
  );
});

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  const accept = c.req.header("Accept") || "";
  if (accept.includes("application/json") || c.req.path.startsWith("/api/")) {
    return c.json({ error: "Internal server error" }, 500);
  }
  return c.html(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Error</title>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0a0a0b;color:#fafafa}</style></head>
    <body><div style="text-align:center"><h1>Something went wrong</h1><p style="color:#a1a1aa">Please try again later.</p><p><a href="/" style="color:#818cf8">Home</a></p></div></body></html>`,
    500,
  );
});

export default app;

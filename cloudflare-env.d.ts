interface CloudflareEnv {
  BIO_KV: KVNamespace;
  SITE_NAME: string;
  SITE_URL: string;
  DEFAULT_THEME: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  ASSETS: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
}

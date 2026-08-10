import type { TranslateFn } from "@/lib/i18n";

/**
 * Translate backup/restore error strings for UI.
 * Supports stable codes written by lib/backup.ts and legacy English messages
 * already stored in KV backup state.
 */
export function translateBackupError(t: TranslateFn, raw: string | undefined | null): string {
  if (!raw) return "";
  const msg = raw.trim();
  if (!msg) return "";

  // Multi-part partial failures: "Partial: a; b" or "partial:a; b"
  const partialPrefix = msg.match(/^(?:Partial:\s*|partial:)(.+)$/i);
  if (partialPrefix) {
    const parts = partialPrefix[1]!
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => translateBackupError(t, p));
    return t("admin.backup.err.partial", { details: parts.join("; ") });
  }

  // Compound "a; b" (full failure join)
  if (msg.includes("; ") && !msg.startsWith("WebDAV HTTP") && !msg.startsWith("Gist")) {
    const parts = msg
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      return parts.map((p) => translateBackupError(t, p)).join("; ");
    }
  }

  // Stable codes: code or code|arg|arg
  if (msg.startsWith("err.")) {
    const [code, ...args] = msg.split("|");
    switch (code) {
      case "err.webdav_url_empty":
        return t("admin.backup.err.webdavUrlEmpty");
      case "err.webdav_auth_required":
        return t("admin.backup.err.webdavAuthRequired");
      case "err.webdav_http":
        return t("admin.backup.err.webdavHttp", {
          status: args[0] || "?",
          detail: args[1] ? `: ${args[1]}` : "",
        });
      case "err.webdav_failed":
        return t("admin.backup.err.webdavFailed");
      case "err.webdav_fetch_failed":
        return t("admin.backup.err.webdavFetchFailed");
      case "err.gist_token_empty":
        return t("admin.backup.err.gistTokenEmpty");
      case "err.gist_id_empty":
        return t("admin.backup.err.gistIdEmpty");
      case "err.gist_http":
        return t("admin.backup.err.gistHttp", {
          status: args[0] || "?",
          detail: args[1] ? `: ${args[1]}` : "",
        });
      case "err.gist_create_http":
        return t("admin.backup.err.gistCreateHttp", {
          status: args[0] || "?",
          detail: args[1] ? `: ${args[1]}` : "",
        });
      case "err.gist_create_no_id":
        return t("admin.backup.err.gistCreateNoId");
      case "err.gist_failed":
        return t("admin.backup.err.gistFailed");
      case "err.gist_no_files":
        return t("admin.backup.err.gistNoFiles");
      case "err.gist_raw_http":
        return t("admin.backup.err.gistRawHttp", { status: args[0] || "?" });
      case "err.gist_content_unavailable":
        return t("admin.backup.err.gistContentUnavailable");
      case "err.gist_fetch_failed":
        return t("admin.backup.err.gistFetchFailed");
      case "err.no_target":
        return t("admin.backup.err.noTarget");
      case "err.backup_failed":
        return t("admin.backup.err.backupFailed");
      case "err.invalid_json":
        return t("admin.backup.err.invalidJson");
      case "err.apply_failed":
        return t("admin.backup.err.applyFailed");
      case "err.network":
        return t("admin.backup.err.network", { message: args.join("|") || "?" });
      default:
        break;
    }
  }

  // Legacy English (already stored in KV)
  const legacy: Record<string, string> = {
    "WebDAV URL is empty": "admin.backup.err.webdavUrlEmpty",
    "WebDAV request failed": "admin.backup.err.webdavFailed",
    "WebDAV fetch failed": "admin.backup.err.webdavFetchFailed",
    "Gist token is empty": "admin.backup.err.gistTokenEmpty",
    "Gist id is empty": "admin.backup.err.gistIdEmpty",
    "Gist create: missing id": "admin.backup.err.gistCreateNoId",
    "Gist request failed": "admin.backup.err.gistFailed",
    "Gist has no files": "admin.backup.err.gistNoFiles",
    "Gist file content unavailable": "admin.backup.err.gistContentUnavailable",
    "Gist fetch failed": "admin.backup.err.gistFetchFailed",
    "No backup target enabled": "admin.backup.err.noTarget",
    "Backup failed": "admin.backup.err.backupFailed",
    "Invalid backup JSON": "admin.backup.err.invalidJson",
    "Failed to apply backup": "admin.backup.err.applyFailed",
  };
  if (legacy[msg]) return t(legacy[msg]!);

  let m = msg.match(/^WebDAV HTTP (\d+)(?::\s*(.*))?$/);
  if (m) {
    return t("admin.backup.err.webdavHttp", {
      status: m[1]!,
      detail: m[2] ? `: ${m[2]}` : "",
    });
  }
  m = msg.match(/^Gist create HTTP (\d+)(?::\s*(.*))?$/);
  if (m) {
    return t("admin.backup.err.gistCreateHttp", {
      status: m[1]!,
      detail: m[2] ? `: ${m[2]}` : "",
    });
  }
  m = msg.match(/^Gist raw HTTP (\d+)$/);
  if (m) return t("admin.backup.err.gistRawHttp", { status: m[1]! });
  m = msg.match(/^Gist HTTP (\d+)(?::\s*(.*))?$/);
  if (m) {
    return t("admin.backup.err.gistHttp", {
      status: m[1]!,
      detail: m[2] ? `: ${m[2]}` : "",
    });
  }

  return msg;
}

export function translateBackupSource(t: TranslateFn, source: string | undefined | null): string {
  if (source === "manual") return t("admin.backup.source.manual");
  if (source === "auto") return t("admin.backup.source.auto");
  return source || "";
}

export function translateBackupTarget(t: TranslateFn, target: string): string {
  if (target === "webdav") return t("admin.backup.target.webdav");
  if (target === "gist") return t("admin.backup.target.gist");
  return target;
}

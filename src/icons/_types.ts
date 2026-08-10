/**
 * Schema for built-in link icons under src/icons/.
 * SVGs are source of truth; registry is build-generated.
 * Runtime has no repo filesystem: only build-time registry + public/icons sync.
 */

export type IconManifest = {
  /** Must match SVG filename without extension (kebab-case) */
  id: string;
  /** English display name (admin UI) */
  label: string;
  /** Chinese display name (admin UI); may equal label */
  labelZh: string;
  /** Public URL path, e.g. /icons/github.svg */
  file: string;
  /** Legacy ids stored in older KV data that map to this icon */
  aliases?: string[];
};

export type IconListItem = Pick<IconManifest, "id" | "label" | "labelZh" | "file">;

/** Always-present fallback icon id (must exist as src/icons/link.svg) */
export const FALLBACK_ICON_ID = "link";

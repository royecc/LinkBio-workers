/**
 * Runtime API for built-in link icons.
 * Source of truth: src/icons/*.svg + meta.json → npm run build:icons.
 * Do not hand-edit the icon list here.
 */
export {
  FALLBACK_ICON_ID,
  ICON_IDS,
  ICON_MANIFESTS,
  ICON_ALIASES,
  getIcon,
  listIcons,
} from "@/src/icons/_registry";
export type { IconListItem, IconManifest } from "@/src/icons/_types";

import {
  FALLBACK_ICON_ID,
  ICON_ALIASES,
  ICON_MANIFESTS,
  getIcon,
} from "@/src/icons/_registry";

/** Admin dropdown + legacy callers expect { id, label, file }. */
export const BUILTIN_ICONS = ICON_MANIFESTS.map((m) => ({
  id: m.id,
  label: m.label,
  file: m.file,
}));

export type BuiltinIconId = string;

export function isBuiltinIcon(id: string): boolean {
  const key = normalizeIconId(id);
  return getIcon(key) != null;
}

export function normalizeIconId(id: string): string {
  const raw = (id || "").trim().toLowerCase();
  if (!raw) return FALLBACK_ICON_ID;
  return ICON_ALIASES[raw] || raw;
}

/** Public URL for a built-in icon, or null if unknown. */
export function resolveIconUrl(id: string): string | null {
  const key = normalizeIconId(id);
  const hit = getIcon(key);
  if (hit) return hit.file;
  return null;
}

/**
 * Resolve display URL for a link icon field.
 * - built-in id → /icons/xxx.svg
 * - http(s) URL → as-is (custom remote)
 * - else → default link icon
 */
export function resolveLinkIconSrc(icon: string): string {
  const raw = (icon || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return resolveIconUrl(raw) || `/icons/${FALLBACK_ICON_ID}.svg`;
}

export function getBuiltinIcon(id: string) {
  const hit = getIcon(normalizeIconId(id));
  if (!hit) return null;
  return { id: hit.id, label: hit.label, file: hit.file };
}

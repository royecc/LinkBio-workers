/**
 * Runtime re-exports of the built theme registry.
 * Run `npm run build:themes` after adding/editing packs under src/themes/.
 */
export {
  FALLBACK_THEME_ID,
  THEME_IDS,
  THEME_MANIFESTS,
  getTheme,
  listThemes,
  resolveThemeId,
} from "@/src/themes/_registry";
export type { ThemeListItem, ThemeManifest } from "@/src/themes/_types";

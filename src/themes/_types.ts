/**
 * Schema for each theme's theme.json (unique standard).
 * Visual tokens live in tokens.css — never put large CSS blobs in JSON.
 *
 * Runtime has no repo filesystem: only build-time registry + bundled CSS.
 */
export type ThemeManifest = {
  /** Must match folder name (kebab-case): aurora | minimal | apple | liquid-glass | … */
  id: string;
  /** English display name (admin UI) */
  name: string;
  /** Chinese display name (admin UI) */
  nameZh: string;
  /** Short description */
  description?: string;
  /** Manifest schema version — start at 1 for migrations */
  version: number;
  /** Relative CSS file under the theme folder; default "tokens.css" */
  tokensFile?: string;
  /**
   * Optional capability flags.
   * Core may ignore unknown keys; do not put logic here.
   */
  features?: {
    blur?: boolean;
    gradientBg?: boolean;
    customFonts?: boolean;
    [key: string]: unknown;
  };
};

export type ThemeListItem = {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  features: {
    blur: boolean;
    gradientBg: boolean;
    customFonts: boolean;
  };
};

/** Always-present fallback pack id (must exist under src/themes/aurora/) */
export const FALLBACK_THEME_ID = "aurora";

/**
 * Documented CSS variables a tokens.css may set under [data-theme-id="…"].
 * Color mode (data-theme=light|dark|system) stays orthogonal in app/globals.css.
 */
export type ThemeTokenVars =
  | "--primary"
  | "--ring"
  | "--theme-radius"
  | "--theme-card-radius"
  | "--theme-link-radius"
  | "--theme-shadow"
  | "--theme-font"
  | "--theme-blur"
  | "--theme-border-opacity"
  | "--theme-card-alpha";


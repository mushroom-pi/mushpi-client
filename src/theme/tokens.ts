/**
 * SINGLE SOURCE OF TRUTH for all colors (and color-adjacent tokens) in the app.
 *
 * Raw hex/rgb/hsl literals are allowed ONLY in this file — everywhere else in
 * `src/**` import from `~theme/tokens` or use `theme.palette.*` / MUI color
 * strings. Enforced by the `no-restricted-syntax` ESLint rule (error) and the
 * stray-color scan in `src/theme/tokens.test.ts`.
 *
 * Exemptions: this file (the source), `ColorSwatchPicker.tsx` FACE_COLORS
 * (user-selectable data palette, not styling), and SVG assets under
 * `src/assets/` + `public/favicon.svg` (static art cannot consume tokens —
 * sync manually if a brand color changes; see REFERENCE.md "Known Quirks").
 *
 * `src/styles/variables.css` mirrors exactly {bg, bgDeep, text} for pre-React
 * mount body painting; the mirror is guarded 1:1 by `tokens.test.ts`.
 */

/** Brand palette — the app's identity colors. */
export const brand = {
  bg: '#0f1720', // deep page background
  bgDeep: '#071013', // darker gradient end-stop (body background fade)
  card: '#0f1b12', // card / paper surface
  accent: '#C66F2F', // warm mushroom cap (primary)
  accent2: '#A27B35', // secondary warm (warning)
  leaf: '#3C8D5A', // green for growth/actions (secondary + success)
  muted: '#9AA6A0', // muted text
  text: '#E6F0EA', // main text
  info: '#7DD3FC', // informational blue (info palette main)
} as const;

/** White-alpha overlays for dark glass surfaces (borders, hover tints, gradients). */
export const veil = {
  faint: 'rgba(255, 255, 255, 0.01)',
  subtle: 'rgba(255, 255, 255, 0.02)',
  hairline: 'rgba(255, 255, 255, 0.03)',
  glass: 'rgba(255, 255, 255, 0.04)',
} as const;

/** Black scrims — darkening overlays on top of images and bars. */
export const scrim = {
  appBar: 'rgba(0, 0, 0, 0.25)', // mobile AppBar gradient end
  image: 'rgba(0, 0, 0, 0.6)', // image action-button backdrop
  imageHover: 'rgba(0, 0, 0, 0.8)', // image action-button backdrop, hovered
} as const;

/** Card corner radius (px) — mirrors the MuiCard styleOverride. */
export const cardRadius = 12;

/** Elevated card / drawer shadow. */
export const cardShadow = '0 8px 24px rgba(2, 6, 2, 0.45)';

/**
 * Physical Pico status-LED colors — these describe what the real LED looks
 * like on the device, so they are hardware truth, not UI theming.
 * `provisioning`/`solid`/`heartbeat` mirror brand tokens by design (the
 * firmware reuses the brand colors); `off` and `error` do NOT:
 * - `off` is the unpowered-LED grey as captured in the LED reference art.
 * - `error` is the Pico's hardware blink red (#C53030), intentionally
 *   distinct from MUI's UI error red — do not "unify" it with
 *   `palette.error`.
 */
export const led = {
  off: '#4a5568',
  error: '#C53030', // physical LED blink red — NOT MUI's UI error color
  provisioning: brand.accent,
  solid: brand.accent2,
  heartbeat: brand.leaf,
} as const;

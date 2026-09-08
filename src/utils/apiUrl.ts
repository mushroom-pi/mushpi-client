/**
 * Resolve a server-returned URL to a browser-loadable absolute URL.
 *
 * The server emits root-relative paths (`/images/recipes/<file>`,
 * `/images/batches/<id>/<file>`) in `image_url` / `images_url`. In same-origin
 * prod (VITE_API_BASE_URL = `/`) these resolve correctly as-is, but in dev
 * (Vite :5173, no proxy) they would 404. This helper prepends the configured
 * API base for relative paths while passing absolute URLs (http(s),
 * protocol-relative, data:, blob:, etc.) through untouched.
 */

const ABSOLUTE_RE = /^(?:\/\/|[a-zA-Z][a-zA-Z0-9+.-]*:)/;

/**
 * Normalized API base URL — `VITE_API_BASE_URL` (fallback
 * `http://localhost:3000`) with all trailing slashes stripped. Single source
 * of truth for `src/api/client.ts`, the Server page docs link, and
 * `resolveApiUrl()` below.
 *
 * The generated axios client naive-concatenates `basePath + url` where `url`
 * is always path-absolute (`/ping`, `/v1/...`), so a base ending in `/` (prod
 * bakes `VITE_API_BASE_URL = /`) would yield protocol-relative URLs
 * (`'/' + '/ping'` = `//ping` → `http://ping`). Stripping trailing slashes
 * makes prod resolve to `''` — an empty string is non-nullish, so it passes
 * the generated code's `??` fallbacks and produces same-origin relative URLs
 * (`/ping`). Absolute dev bases (`http://localhost:3000`) are unaffected.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export function resolveApiUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Absolute URL (http://, https://, //, data:, blob:, etc.) — pass through.
  if (ABSOLUTE_RE.test(url)) return url;

  // Relative path — prepend the normalized API base.
  const path = url.replace(/^\/+/, '');
  return API_BASE ? `${API_BASE}/${path}` : `/${path}`;
}

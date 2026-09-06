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

export function resolveApiUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Absolute URL (http://, https://, //, data:, blob:, etc.) — pass through.
  if (ABSOLUTE_RE.test(url)) return url;

  // Relative path — prepend the configured API base.
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(
    /\/+$/,
    '',
  );
  const path = url.replace(/^\/+/, '');
  return apiBase ? `${apiBase}/${path}` : `/${path}`;
}

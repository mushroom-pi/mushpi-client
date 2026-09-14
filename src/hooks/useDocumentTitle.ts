import { useEffect } from 'react';

/** Browser-tab suffix — matches the server's "Mushroom Pi API — Swagger UI" branding. */
const SITE_NAME = 'Mushroom Pi';

/**
 * Sets the browser tab title to `<title> — Mushroom Pi`.
 * Call exactly once per route page. Detail pages call it inside the *Inner
 * component with `entity?.name ?? \`Entity #${id}\`` so the tab shows an
 * id-based title at navigation time and refines once data resolves.
 * Idempotent assignment — safe under StrictMode.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`;
  }, [title]);
}

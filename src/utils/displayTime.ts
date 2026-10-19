import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/** localStorage key holding the demo-hub display-timezone override. */
export const DISPLAY_TIMEZONE_STORAGE_KEY = 'mushpi-display-timezone';

/**
 * Demo gate. The stored display-timezone override applies ONLY while the hub
 * reports the demo environment; `useDemoMode` flips this flag once health
 * resolves. Default `false` means: during the health fetch and on every
 * non-demo hub, `getDisplayTimezoneOverride()` returns `null` and each
 * formatter below takes the exact pre-gate code path (`toLocaleString()` /
 * `dayjs().format()`), byte-identical to how it always rendered. A stored
 * override carried onto a non-demo hub is ignored entirely.
 */
let overrideEnabled = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setDisplayTimezoneOverrideEnabled(enabled: boolean): void {
  if (overrideEnabled === enabled) return;
  overrideEnabled = enabled;
  emit();
}

export function subscribeDisplayTimezoneStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The stored override — or null when unset, unreadable, or the hub is not demo. */
export function getDisplayTimezoneOverride(): string | null {
  if (!overrideEnabled) return null;
  try {
    return localStorage.getItem(DISPLAY_TIMEZONE_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Persist the demo-hub override (storage failures are silently non-persisting). */
export function writeDisplayTimezoneOverride(tz: string): void {
  try {
    localStorage.setItem(DISPLAY_TIMEZONE_STORAGE_KEY, tz);
  } catch {
    // storage unavailable (private mode) — the setting simply will not persist
  }
  emit();
}

/**
 * Locale-string timestamp (`prettyDate` path). Without an active override the
 * call is plain `toLocaleString()`; the demo override shifts zones via the
 * `timeZone` option so the same locale formatting applies.
 */
export function displayLocaleString(ts?: string | null): string {
  if (!ts) return '—';
  const tz = getDisplayTimezoneOverride();
  return tz
    ? new Date(ts).toLocaleString(undefined, { timeZone: tz })
    : new Date(ts).toLocaleString();
}

/**
 * dayjs `format(pattern)` with the demo override applied. Without an active
 * override this is exactly `dayjs(value).format(pattern)`.
 */
export function formatInDisplayZone(value: dayjs.ConfigType, pattern: string): string {
  const tz = getDisplayTimezoneOverride();
  const d = dayjs(value);
  return tz ? d.tz(tz).format(pattern) : d.format(pattern);
}

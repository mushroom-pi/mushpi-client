/**
 * Generic retry-cooldown store: records how long the client must wait before
 * sending another request after the server answers `429` with a `Retry-After`
 * header. Pure mechanism — holds no message text; the server owns all wording.
 */

let cooldownUntil = 0;
let clearTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Parse the server's `Retry-After` header from an axios error.
 * Only a `429` response arms the cooldown — a `403` refusal (which carries no
 * `Retry-After`) never does. Accepts a relative-seconds value first and falls
 * back to an HTTP-date. Returns `null` when absent/unparseable.
 */
export function retryAfterSeconds(err: unknown): number | null {
  const response = (err as { response?: unknown })?.response as
    | { status?: number; headers?: unknown }
    | undefined;
  if (!response || response.status !== 429) return null;

  const headers = response.headers as
    | Record<string, unknown>
    | { get?: (name: string) => unknown }
    | undefined;
  if (!headers) return null;

  const raw =
    typeof (headers as { get?: unknown }).get === 'function'
      ? (headers as { get: (name: string) => unknown }).get('retry-after')
      : ((headers as Record<string, unknown>)['retry-after'] ??
        (headers as Record<string, unknown>)['Retry-After']);
  if (raw == null) return null;

  const value = String(raw).trim();
  if (/^\d+$/.test(value)) {
    const seconds = parseInt(value, 10);
    return Number.isFinite(seconds) ? seconds : null;
  }

  const when = Date.parse(value);
  if (!Number.isNaN(when)) {
    return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  }
  return null;
}

/** Record a cooldown of `seconds` from now and notify subscribers. */
export function recordRetryCooldown(seconds: number): void {
  const ms = Math.max(seconds, 0) * 1000;
  cooldownUntil = Date.now() + ms;
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    cooldownUntil = 0;
    clearTimer = undefined;
    emit();
  }, ms);
  emit();
}

/** Clear the cooldown (used by tests for isolation). */
export function resetRetryCooldown(): void {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = undefined;
  cooldownUntil = 0;
  emit();
}

export function getCooldownUntil(): number {
  return cooldownUntil;
}

export function subscribeRetryCooldown(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

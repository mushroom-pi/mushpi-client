import { useSyncExternalStore } from 'react';

import { getCooldownUntil, subscribeRetryCooldown } from '~utils/retryCooldown';

/**
 * Reactive view of the retry cooldown recorded from a server `429` +
 * `Retry-After` response. `isCoolingDown` flips back to `false` automatically
 * when the window expires — no page reload needed to act again.
 */
export function useRetryCooldown() {
  const cooldownUntil = useSyncExternalStore(subscribeRetryCooldown, getCooldownUntil);
  return { isCoolingDown: cooldownUntil > Date.now(), cooldownUntil };
}

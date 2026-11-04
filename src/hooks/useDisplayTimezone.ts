import { useCallback, useMemo, useSyncExternalStore } from 'react';

import {
  getDisplayTimezoneOverride,
  subscribeDisplayTimezoneStore,
  writeDisplayTimezoneOverride,
} from '~utils/displayTime';

/**
 * Demo-hub display timezone: the stored `localStorage` override — honored ONLY
 * while the hub reports the demo environment (the gate lives in
 * `utils/displayTime`) — otherwise the browser's own zone. On non-demo hubs
 * the stored value is invisible: reads return null and nothing is written.
 */
export function useDisplayTimezone() {
  const stored = useSyncExternalStore(subscribeDisplayTimezoneStore, getDisplayTimezoneOverride);
  const browserTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const setTimezone = useCallback((tz: string) => {
    writeDisplayTimezoneOverride(tz);
  }, []);

  return { timezone: stored ?? browserTimezone, setTimezone, isOverridden: stored !== null };
}

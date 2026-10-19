import { useEffect } from 'react';

import { useServerHealth } from '~hook/useServerHealth';
import { setDisplayTimezoneOverrideEnabled } from '~utils/displayTime';

/**
 * Thin wrapper over the shared health query (`serverHealthKeys.all` — no new
 * query key, React Query dedupes it across consumers). The literal `'demo'`
 * comparison is a deliberate compile-time contract guard: if the generated
 * `ServerDtoEnvironmentEnum` ever drops the `demo` member, `tsc` fails here.
 *
 * Side effect: mirrors `isDemo` into the display-timezone demo gate
 * (`utils/displayTime`) so the per-browser override applies ONLY on demo hubs.
 * Default (and every loading window) is non-demo: the gate stays closed.
 */
export const useDemoMode = () => {
  const { data: serverHealth, isLoading } = useServerHealth();
  const isDemo = serverHealth?.server?.environment === 'demo';

  useEffect(() => {
    setDisplayTimezoneOverrideEnabled(isDemo);
  }, [isDemo]);

  return { isDemo, isLoading };
};

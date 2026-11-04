import type { ConfigType } from 'dayjs';

import { formatInDisplayZone } from './displayTime';

/** Always returns true so both chart components apply the rotated-label layout. */
export const isLongSpan = (_data: { ts: number }[]): boolean => true;

/**
 * Shared chart timestamp label ("MMM DD HH:mm") for ticks and tooltips.
 * Honors the per-browser display-timezone override when set; with no override
 * it is byte-identical to `dayjs(ts).format('MMM DD HH:mm')`.
 */
export const formatChartTimestamp = (ts: ConfigType): string =>
  formatInDisplayZone(ts, 'MMM DD HH:mm');

/** Factory: returns a tickFormatter function for Recharts XAxis.
 *  Always formats as "MMM DD HH:mm" for full date+time labels.
 */
export const createTickFormatter = (_data: { ts: number }[]) => {
  return (ts: number) => formatChartTimestamp(ts);
};

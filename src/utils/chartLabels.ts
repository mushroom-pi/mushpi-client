import dayjs from 'dayjs';

/** Compute whether the data span exceeds 24 hours */
export const isLongSpan = (data: { ts: number }[]): boolean =>
  data.length > 1 && data[data.length - 1].ts - data[0].ts > 24 * 3600 * 1000;

/** Factory: returns a tickFormatter function for Recharts XAxis.
 *  - short span (≤24h): "HH:mm"
 *  - long span (>24h): "MMM DD HH:mm"
 */
export const createTickFormatter = (data: { ts: number }[]) => {
  const showDate = isLongSpan(data);
  return (ts: number) => {
    const d = dayjs(ts);
    return showDate ? d.format('MMM DD HH:mm') : d.format('HH:mm');
  };
};

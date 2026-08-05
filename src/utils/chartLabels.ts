import dayjs from 'dayjs';

/** Always returns true so both chart components apply the rotated-label layout. */
export const isLongSpan = (_data: { ts: number }[]): boolean => true;

/** Factory: returns a tickFormatter function for Recharts XAxis.
 *  Always formats as "MMM DD HH:mm" for full date+time labels.
 */
export const createTickFormatter = (_data: { ts: number }[]) => {
  return (ts: number) => {
    const d = dayjs(ts);
    return d.format('MMM DD HH:mm');
  };
};

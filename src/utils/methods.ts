import dayjs from 'dayjs';

/** Formats an ISO date string for use in a datetime-local input. Returns '' for null/undefined. */
export const toDateTimeLocal = (value?: string | null): string =>
  value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';

export function bytesToMB(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  return (bytes / (1024 * 1024)).toFixed(2);
}

export const percentage = (part?: number, total?: number): number => {
  if (
    !part ||
    !total ||
    part === null ||
    total === null ||
    Number.isNaN(part) ||
    Number.isNaN(total)
  )
    return 0;

  return Math.round((10000 * part) / total) / 100;
};

export const prettyDate = (ts?: string) => (ts ? new Date(ts).toLocaleString() : '—');

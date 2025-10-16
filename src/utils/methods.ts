export function bytesToMB(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const percentage = (part?: number, total?: number): number => {
  if (
    !part ||
    !total ||
    part === null ||
    total === null ||
    Number.isNaN(part) ||
    Number.isNaN(part)
  )
    return 0;

  return Math.round((10000 * part) / total) / 100;
};

export const prettyDate = (ts?: string) => (ts ? new Date(ts).toLocaleString() : '—');

export const chipColorForFailedCalls = (failedCalls: number | null) => {
  if (!failedCalls) return 'success';
  if (failedCalls < 3) return 'warning';
  return 'error';
};

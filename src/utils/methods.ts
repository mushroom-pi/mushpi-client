export function bytesToMB(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

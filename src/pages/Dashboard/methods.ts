import dayjs from 'dayjs';

/** Format seconds-since-last-seen into human readable string */
export function formatLastSeen(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  if (seconds < 60) return '<1m ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/** Format uptime hours into human readable string */
export function formatUptime(hours: number): string {
  if (hours < 1) return '<1h';
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  if (d === 0) return `${h}h`;
  if (h === 0) return `${d}d`;
  return `${d}d ${h}h`;
}

/** Format ISO timestamp to relative "X ago" string using dayjs diff */
export function formatRelativeFromNow(iso: string): string {
  const diffSeconds = dayjs().diff(dayjs(iso), 'second');
  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

/** Format large numbers with locale string */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Get MUI Chip color based on urgency */
export function urgencyColor(daysRemaining: number): 'error' | 'warning' | 'default' {
  if (daysRemaining <= 1) return 'error';
  if (daysRemaining <= 3) return 'warning';
  return 'default';
}

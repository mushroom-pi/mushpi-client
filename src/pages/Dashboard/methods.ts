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

/** Max graphemes kept from a batch description before the ellipsis is appended */
const CLIP_MAX = 20;
/** Trimmed descriptions up to this many graphemes render unchanged (no dots) */
const CLIP_THRESHOLD = 23;
/** Literal ellipsis appended to truncated descriptions (three ASCII periods) */
const ELLIPSIS = '...';

/** Split text into grapheme clusters; falls back to code points where Intl.Segmenter is unavailable */
function splitGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter !== 'undefined') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

/** Count grapheme clusters of a string */
function countGraphemes(text: string): number {
  return splitGraphemes(text).length;
}

/** First `n` graphemes of a string, joined — never splits a surrogate pair or ZWJ sequence */
function takeGraphemes(text: string, n: number): string {
  return splitGraphemes(text).slice(0, n).join('');
}

/**
 * Clip a batch description for the single-line dashboard unit-card chip.
 *
 * Trims first; descriptions of up to CLIP_THRESHOLD graphemes pass through
 * unchanged (no dots), longer ones keep their first CLIP_MAX graphemes plus a
 * literal ellipsis — so a clipped result is always exactly CLIP_THRESHOLD
 * graphemes. Counting and slicing are grapheme-based, so emoji (surrogate
 * pairs, flags, ZWJ sequences) are never torn in half.
 */
export function clipBatchDescription(raw: string): string {
  const trimmed = raw.trim();
  if (countGraphemes(trimmed) <= CLIP_THRESHOLD) return trimmed;
  return `${takeGraphemes(trimmed, CLIP_MAX)}${ELLIPSIS}`;
}

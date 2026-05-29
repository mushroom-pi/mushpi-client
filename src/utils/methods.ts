import dayjs from 'dayjs';

import type { ChartPoint } from '~type/charts';

/** Formats an ISO date string for use in a datetime-local input. Returns '' for null/undefined. */
export const toDateTimeLocal = (value?: string | null): string =>
  value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';

type OnOffChartKey = 'fan' | 'heater' | 'humidifier' | 'control_loop';

const DEFAULT_ON_OFF_KEYS: OnOffChartKey[] = ['fan', 'heater', 'humidifier', 'control_loop'];

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

export const downsampleChartPoints = (
  points: ChartPoint[],
  maxPoints: number = 100,
): ChartPoint[] => {
  if (maxPoints < 2 || points.length <= maxPoints) return points;

  const sampled: ChartPoint[] = [];
  const stride = (points.length - 1) / (maxPoints - 1);

  for (let i = 0; i < maxPoints; i += 1) {
    const idx = Math.round(i * stride);
    const point = points[idx];
    const prev = sampled[sampled.length - 1];

    if (point && point !== prev) sampled.push(point);
  }

  const last = points[points.length - 1];
  if (last && sampled[sampled.length - 1] !== last) sampled.push(last);

  return sampled;
};

export const rleDeduplicateOnOffPoints = (
  points: ChartPoint[],
  keys: OnOffChartKey[] = DEFAULT_ON_OFF_KEYS,
): ChartPoint[] => {
  if (points.length <= 2) return points;

  const keep = new Set<number>([0, points.length - 1]);

  for (const key of keys) {
    for (let i = 1; i < points.length; i += 1) {
      if (points[i][key] !== points[i - 1][key]) {
        keep.add(i - 1);
        keep.add(i);
      }
    }
  }

  return [...keep]
    .sort((a, b) => a - b)
    .map((idx) => points[idx])
    .filter(Boolean);
};

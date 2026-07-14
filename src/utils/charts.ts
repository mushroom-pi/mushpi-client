import type { ChartPoint } from '~type/charts';

type OnOffChartKey = 'fan' | 'heater' | 'humidifier' | 'control_loop';

const DEFAULT_ON_OFF_KEYS: OnOffChartKey[] = ['fan', 'heater', 'humidifier', 'control_loop'];

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

export const smartSampleChartPoints = (
  points: ChartPoint[],
  maxPoints: number = 50,
): ChartPoint[] => {
  if (maxPoints < 2 || points.length <= maxPoints) return points;

  const keepIndices = new Set<number>([0, points.length - 1]);

  for (const key of DEFAULT_ON_OFF_KEYS) {
    for (let i = 1; i < points.length; i += 1) {
      if (points[i][key] !== points[i - 1][key]) {
        keepIndices.add(i - 1);
        keepIndices.add(i);
      }
    }
  }

  if (keepIndices.size >= maxPoints) {
    return downsampleChartPoints(points, maxPoints);
  }

  const remaining = maxPoints - keepIndices.size;
  const stride = points.length / (remaining + 1);
  for (let i = 1; i <= remaining; i += 1) {
    keepIndices.add(Math.round(i * stride));
  }

  return [...keepIndices].sort((a, b) => a - b).map((idx) => points[idx]);
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

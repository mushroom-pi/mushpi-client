import { useMemo } from 'react';

import { bytesToMB } from 'src/utils/methods';

import type { Readings } from '~api/generated';
import type { ChartPoint } from '~type/charts';

import { useListPicoUnitReadings } from './useReadings';

export const fmtTsShort = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  // e.g. 22 Oct 15:23
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toChartPoints = (items: Readings[]): ChartPoint[] =>
  items.map((it) => ({
    label: fmtTsShort(it.ts),
    temperature: it.temperature,
    humidity: it.humidity,
    temperature_target: it.temperature_set,
    humidity_target: it.humidity_set,
    board_used_mem: bytesToMB(it.board_used_mem),
    fan: it.fan_on ? 1 : 0,
    humidifier: it.humidifier_on ? 1 : 0,
    heater: it.heater_on ? 1 : 0,
    control_loop: it.control_loop_enabled ? 1 : 0,
  }));

const SAMPLE_TICK_COUNT = 5;

export function useCharts(params: {
  picoUnitId: number;
  start?: string | Date | null;
  end?: string | Date | null;
  page?: number;
  limit?: number;
}) {
  const { picoUnitId, start, end, page = 1, limit = 500 } = params;

  const query = useListPicoUnitReadings({
    picoUnitId,
    start: start ?? undefined,
    end: end ?? undefined,
    page,
    limit,
  });

  const chartsData = useMemo<ChartPoint[]>(() => {
    if (!query.data) return [];

    return toChartPoints(query.data.items);
  }, [query.data]);

  const labels = useMemo(() => chartsData.map((d) => d.label ?? ''), [chartsData]);

  const commonTicks = useMemo(() => {
    if (!labels.length) return [];
    const maxTicks = Math.min(SAMPLE_TICK_COUNT, labels.length);
    if (maxTicks <= 1) return labels;
    const step = Math.max(1, Math.floor((labels.length - 1) / (maxTicks - 1)));
    const ticks = labels.filter((_, i) => i % step === 0);
    if (ticks[ticks.length - 1] !== labels[labels.length - 1]) {
      ticks.push(labels[labels.length - 1]);
    }
    return ticks;
  }, [labels]);

  return {
    // data
    chartsData,
    labels,
    commonTicks,
    // react-query control bits passthrough
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // raw response if needed
    raw: query.data,
  } as const;
}

import dayjs from 'dayjs';
import { useMemo } from 'react';

import type { AggregatedReadingDto } from '~api/generated';
import { useListPicoUnitReadings } from '~hook/useReadings';
import type { AggregatedChartPoint } from '~type/charts';

import type { ChartsReadingsParams } from './provider';

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

export const toAggregatedChartPoints = (items: AggregatedReadingDto[]): AggregatedChartPoint[] =>
  items.map((it) => {
    const tempRange =
      it.tempMin != null && it.tempMax != null ? ([it.tempMin, it.tempMax] as [number, number]) : undefined;
    const humidityRange =
      it.humidityMin != null && it.humidityMax != null
        ? ([it.humidityMin, it.humidityMax] as [number, number])
        : undefined;

    const fanOnCount = it.fanOnCount ?? 0;
    const humidifierOnCount = it.humidifierOnCount ?? 0;
    const heaterOnCount = it.heaterOnCount ?? 0;
    const controlLoopEnabledCount = it.controlLoopEnabledCount ?? 0;
    const halfCount = it.readingCount / 2;

    return {
      label: fmtTsShort(it.timestamp),
      ts: dayjs(it.timestamp).valueOf(),
      temperature: it.temperature,
      humidity: it.humidity,
      tempMin: it.tempMin,
      tempMax: it.tempMax,
      humidityMin: it.humidityMin,
      humidityMax: it.humidityMax,
      readingCount: it.readingCount,
      fanOnCount,
      humidifierOnCount,
      heaterOnCount,
      controlLoopEnabledCount,
      temperatureSet: it.temperatureSet ?? null,
      humiditySet: it.humiditySet ?? null,
      tempRange,
      humidityRange,
      fanOn: fanOnCount > halfCount ? 1 : 0,
      humidifierOn: humidifierOnCount > halfCount ? 1 : 0,
      heaterOn: heaterOnCount > halfCount ? 1 : 0,
      controlLoopEnabled: controlLoopEnabledCount > halfCount ? 1 : 0,
    };
  });

const SAMPLE_TICK_COUNT = 5;

export function useCharts(
  params: ChartsReadingsParams,
  enabled: boolean = true,
) {
  const { picoUnitId, timeWindow, points } = params;

  const query = useListPicoUnitReadings(
    { picoUnitId, timeWindow, points },
    enabled,
  );

  const chartsData = useMemo<AggregatedChartPoint[]>(() => {
    if (!query.data) return [];
    // Server returns newest-first; reverse for left-to-right chronological chart order
    const items = [...query.data.data].reverse();
    return toAggregatedChartPoints(items);
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
  };
}

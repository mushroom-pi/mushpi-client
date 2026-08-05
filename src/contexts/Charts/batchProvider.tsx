import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';

import type { Batch } from '~api/generated';
import { useListBatchReadings } from '~hook/useBatchReadings';
import { useChartContainerWidth } from '~hook/useChartContainerWidth';

import { toAggregatedChartPoints } from './hooks';
import { ChartsContext, type ChartsContextValue } from './provider';

const DEFAULT_POINTS = 200;
const SAMPLE_TICK_COUNT = 5;

interface BatchChartsProviderProps {
  batchId: number;
  batch: Batch;
}

export const BatchChartsProvider: React.FC<React.PropsWithChildren<BatchChartsProviderProps>> = ({
  batchId,
  batch,
  children,
}) => {
  const { points: autoPoints } = useChartContainerWidth();
  const [points, setPoints] = useState<number | 'auto'>(DEFAULT_POINTS);

  const resolvedPoints = points === 'auto' ? autoPoints : points;

  const query = useListBatchReadings({
    batchId,
    start: batch.start_at,
    end: batch.finish_at ?? undefined,
    points: resolvedPoints,
  });

  const chartsData = useMemo(() => {
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

  const queryData = useMemo(
    () => (query.data ? omit(query.data, 'data') : null),
    [query.data],
  );

  const value = useMemo<ChartsContextValue>(
    () => ({
      chartsData,
      labels,
      commonTicks,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error,
      queryData: queryData ?? null,
      params: undefined,
      setParams: () => {},
      points,
      setPoints,
    }),
    [
      chartsData,
      labels,
      commonTicks,
      query.isLoading,
      query.isFetching,
      query.isError,
      query.error,
      queryData,
      points,
    ],
  );

  return <ChartsContext.Provider value={value}>{children}</ChartsContext.Provider>;
};

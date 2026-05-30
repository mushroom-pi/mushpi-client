import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';

import { useListBatchReadings } from '~hook/useBatchReadings';

import { smartSampleChartPoints } from 'src/utils/methods';
import type { Batch } from '~api/generated';
import { toChartPoints } from './hooks';
import { ChartsContext, type ChartsContextValue } from './provider';

const DEFAULT_DISPLAY_POINTS = 100;
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
  const [displayPoints, setDisplayPoints] = useState(DEFAULT_DISPLAY_POINTS);

  const query = useListBatchReadings({
    batchId,
    start: batch.start_at,
    end: batch.finish_at ?? undefined,
    page: 1,
    limit: 500,
  });

  const chartsData = useMemo(() => {
    if (!query.data) return [];
    const points = toChartPoints(query.data.items);
    return smartSampleChartPoints(points, displayPoints);
  }, [query.data, displayPoints]);

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
    () => (query.data ? omit(query.data, 'items') : null),
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
      displayPoints,
      setDisplayPoints,
    }),
    [chartsData, labels, commonTicks, query.isLoading, query.isFetching, query.isError, query.error, queryData, displayPoints],
  );

  return <ChartsContext.Provider value={value}>{children}</ChartsContext.Provider>;
};

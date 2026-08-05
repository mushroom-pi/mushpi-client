import { omit } from 'lodash';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type {
  AggregatedReadingsResponseDto,
  ReadingsApiPicoUnitIdReadingsControllerListForUnitV1Request as ListPicoUnitReadingsParams,
} from '~api/generated';
import { useChartContainerWidth } from '~hook/useChartContainerWidth';
import type { AggregatedChartPoint } from '~type/charts';

import { useCharts } from './hooks';

export type ChartsContextValue = {
  chartsData: AggregatedChartPoint[];
  labels: string[];
  commonTicks: string[];
  isLoading: boolean;
  isFetching: boolean;
  isError?: boolean;
  error?: unknown;
  params?: ListPicoUnitReadingsParams;
  setParams: (p: ListPicoUnitReadingsParams) => void;
  queryData: Omit<AggregatedReadingsResponseDto, 'data'> | null;
  points: number | 'auto';
  setPoints: (n: number | 'auto') => void;
};

interface ChartsContextProps {
  initialParams: ListPicoUnitReadingsParams;
}

export const ChartsContext = createContext<ChartsContextValue | undefined>(undefined);

export const ChartsProvider = ({
  children,
  initialParams,
}: React.PropsWithChildren<ChartsContextProps>) => {
  const { points: autoPoints } = useChartContainerWidth();
  const [points, setPoints] = useState<number | 'auto'>(200);

  const resolvedPoints = points === 'auto' ? autoPoints : points;

  const [params, setParams] = useState<ListPicoUnitReadingsParams>(() => ({
    points: resolvedPoints,
    ...initialParams,
  }));

  useEffect(() => {
    if (initialParams?.picoUnitId != null && initialParams.picoUnitId !== params.picoUnitId) {
      setParams((prev: ListPicoUnitReadingsParams) => ({ ...prev, ...initialParams }));
    }
  }, [initialParams?.picoUnitId]);

  // Keep query points in sync when auto-resolved value changes
  useEffect(() => {
    setParams((prev) => ({ ...prev, points: resolvedPoints }));
  }, [resolvedPoints]);

  const query = useCharts(params, true);
  const { chartsData, raw, labels, commonTicks, isLoading, isFetching, isError, error } = query;
  const queryData = useMemo(() => (raw ? omit(raw, 'data') : null), [raw]);

  const contextValue: ChartsContextValue = useMemo(
    () => ({
      chartsData,
      labels,
      commonTicks,
      isLoading,
      isFetching,
      isError,
      error,
      queryData,
      params,
      setParams,
      points,
      setPoints,
    }),
    [
      chartsData,
      labels,
      commonTicks,
      isLoading,
      isFetching,
      isError,
      error,
      queryData,
      params,
      points,
    ],
  );

  return <ChartsContext.Provider value={contextValue}>{children}</ChartsContext.Provider>;
};

export function useChartsContext() {
  const ctx = useContext(ChartsContext);
  if (!ctx) {
    throw new Error('useCharts must be used within a ChartsProvider');
  }
  return ctx;
}

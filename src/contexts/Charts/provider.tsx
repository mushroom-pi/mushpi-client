import { omit } from 'lodash';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type {
  ReadingsApiPicoUnitIdReadingsControllerListForUnitRequest as ListPicoUnitReadingsParams,
  ReadingsListResponseDto,
} from '~api/generated';
import type { ChartPoint } from '~type/charts';

import { useCharts } from './hooks';

export type ChartsContextValue = {
  chartsData: ChartPoint[];
  labels: string[];
  commonTicks: string[];
  isLoading: boolean;
  isFetching: boolean;
  isError?: boolean;
  error?: unknown;
  params?: ListPicoUnitReadingsParams;
  setParams: (p: ListPicoUnitReadingsParams) => void;
  queryData: Omit<ReadingsListResponseDto, 'items'> | null;
  displayPoints: number;
  setDisplayPoints: (n: number) => void;
};

interface ChartsContextProps {
  initialParams: ListPicoUnitReadingsParams;
}

export const ChartsContext = createContext<ChartsContextValue | undefined>(undefined);

export const ChartsProvider = ({
  children,
  initialParams,
}: React.PropsWithChildren<ChartsContextProps>) => {
  const [params, setParams] = useState<ListPicoUnitReadingsParams>(initialParams);
  const [displayPoints, setDisplayPoints] = useState(50);

  useEffect(() => {
    if (initialParams?.picoUnitId != null && initialParams.picoUnitId !== params.picoUnitId) {
      setParams((prev) => ({ ...prev, ...initialParams }));
    }
  }, [initialParams?.picoUnitId]);

  const query = useCharts(params, true, displayPoints);
  const { chartsData, raw, labels, commonTicks, isLoading, isFetching, isError, error } = query;
  const queryData = useMemo(() => omit(raw, 'items'), [raw]);

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
      displayPoints,
      setDisplayPoints,
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
      displayPoints,
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

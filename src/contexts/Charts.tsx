import React, { createContext, useContext, useMemo } from 'react';

import type { ChartPoint } from '~type/charts';

export type ChartsContextValue = {
  chartsData: ChartPoint[];
  labels: string[];
  commonTicks: string[];
};

const ChartsContext = createContext<ChartsContextValue | undefined>(undefined);

export const ChartsProvider = ({
  children,
  chartsData,
  labels,
  commonTicks,
}: React.PropsWithChildren<ChartsContextValue>) => {
  // memoize to keep stable reference for consumers
  const value = useMemo(
    () => ({ chartsData, labels, commonTicks }),
    [chartsData, labels, commonTicks],
  );

  return <ChartsContext.Provider value={value}>{children}</ChartsContext.Provider>;
};

export function useChartsContext() {
  const ctx = useContext(ChartsContext);
  if (!ctx) {
    throw new Error('useCharts must be used within a ChartsProvider');
  }
  return ctx;
}

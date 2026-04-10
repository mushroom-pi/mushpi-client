import type React from 'react';

import { Error, Loading } from '~components';
import { useChartsContext } from '~ctx/Charts';

interface FallbackChartProps {
  item: string;
  children: React.ReactNode;
}

export const FallbackChart: React.FC<FallbackChartProps> = ({ children, item }) => {
  const { chartsData: data, isFetching, isLoading, isError, error } = useChartsContext();

  return !data || isFetching || isLoading ? (
    <Loading item={item} />
  ) : !data.length || isError ? (
    <Error item={item} error={error} />
  ) : (
    children
  );
};

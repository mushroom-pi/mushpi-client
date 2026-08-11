import { Box, Typography } from '@mui/material';
import type React from 'react';

import { Error, Loading } from '~components';
import { useChartsContext } from '~ctx/Charts';

interface FallbackChartProps {
  item: string;
  children: React.ReactNode;
}

export const FallbackChart: React.FC<FallbackChartProps> = ({ children, item }) => {
  const { chartsData: data, isFetching, isLoading, isError, error } = useChartsContext();

  if (!data || isFetching || isLoading) return <Loading item={item} />;
  if (isError) return <Error item={item} error={error} />;
  if (!data.length) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={160}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
      >
        <Typography color="text.secondary" variant="body2">
          No data to display for this time period
        </Typography>
      </Box>
    );
  }

  return children;
};

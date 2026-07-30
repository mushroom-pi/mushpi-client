import { Box, Skeleton } from '@mui/material';

import { ChartsTabsSkeleton } from '~components';

export function ReadingsSkeleton() {
  return (
    <>
      <Box sx={{ mb: 2.5 }}>
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 1.5 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
      </Box>
      <ChartsTabsSkeleton />
    </>
  );
}

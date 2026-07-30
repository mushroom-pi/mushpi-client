import { Box, Skeleton } from '@mui/material';

import { ChartsTabsSkeleton, PageTitle } from '~components';
import { Page } from '~layout/Page';

export function ReadingsSkeleton() {
  return (
    <Page>
      <PageTitle mb={2.5}>Readings</PageTitle>
      <Box sx={{ mb: 2.5 }}>
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 1.5 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
      </Box>
      <ChartsTabsSkeleton />
    </Page>
  );
}

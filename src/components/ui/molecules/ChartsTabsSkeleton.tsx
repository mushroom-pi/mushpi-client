import { Box, Skeleton } from '@mui/material';

export interface ChartsTabsSkeletonProps {
  /** Show a subtitle text skeleton above the chart area. Default: true. */
  showSubtitle?: boolean;
}

export function ChartsTabsSkeleton({ showSubtitle = true }: ChartsTabsSkeletonProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex' }}>
        <Skeleton variant="rounded" width={150} height={36} sx={{ mr: 1 }} />
        <Skeleton variant="rounded" width={150} height={36} sx={{ mr: 1 }} />
        <Skeleton variant="rounded" width={150} height={36} />
      </Box>
      {showSubtitle && <Skeleton variant="text" width="35%" sx={{ mt: 1.5 }} />}
      <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 1, mt: 1 }} />
    </Box>
  );
}

import { Grid } from '@mui/material';

import { CardSkeleton } from '../atoms/CardSkeleton';

export interface CardGridSkeletonProps {
  count: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export function CardGridSkeleton({ count, xs = 12, sm = 6, md = 4, lg }: CardGridSkeletonProps) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }, (_, i) => (
        <Grid
          key={i}
          size={{
            xs,
            sm,
            md,
            ...(lg != null && { lg }),
          }}
        >
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

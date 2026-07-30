import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material';

import { CardSkeleton, ItemPage, TableSkeleton } from '~components';

export function PicoUnitDetailSkeleton() {
  return (
    <ItemPage
      title={<Skeleton variant="text" width={200} height={40} />}
      titleAdornment={<Skeleton variant="circular" width={28} height={28} />}
      actions={<Skeleton variant="rounded" width={220} height={36} />}
      meta={
        <>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="text" width={120} />
          </Stack>
          <Skeleton variant="text" width="70%" sx={{ mb: 3 }} />
        </>
      }
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CardSkeleton variant="card" lines={2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CardSkeleton variant="card" lines={2} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton variant="card" lines={3} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={28} sx={{ mb: 1 }} />
              <TableSkeleton columns={6} rows={4} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ItemPage>
  );
}

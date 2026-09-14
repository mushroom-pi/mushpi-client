import { Card, CardContent, Divider, Grid, Skeleton, Stack } from '@mui/material';

import { ItemPage, TableSkeleton } from '~components';

export function RecipeDetailSkeleton() {
  return (
    <ItemPage
      title={<Skeleton variant="text" width={160} height={40} />}
      actions={
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={120} height={36} />
          <Skeleton variant="rounded" width={120} height={36} />
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={1}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <Skeleton key={i} variant="text" />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 1 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Skeleton variant="text" width="45%" height={28} />
              <Skeleton variant="circular" width={28} height={28} />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <TableSkeleton columns={5} rows={4} />
          </CardContent>
        </Card>
      </Stack>
    </ItemPage>
  );
}

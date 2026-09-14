import { Box, Card, CardContent, Divider, Grid, Skeleton, Stack } from '@mui/material';

import { ChartsTabsSkeleton, ItemPage } from '~components';

export function BatchDetailSkeleton() {
  return (
    <>
      <ItemPage
        title={<Skeleton variant="text" width={180} height={40} />}
        titleAdornment={<Skeleton variant="rounded" width={70} height={24} />}
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Skeleton variant="rounded" width={150} height={36} />
            <Skeleton variant="rounded" width={120} height={36} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Stack>
        }
      >
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={1}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <Skeleton key={i} variant="text" />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={120}
                      height={120}
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Stack>
                <Skeleton variant="text" width="60%" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
          <ChartsTabsSkeleton />
        </Box>
      </ItemPage>
    </>
  );
}

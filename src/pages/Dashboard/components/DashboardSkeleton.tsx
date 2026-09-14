import { Box, Card, CardContent, Grid, Paper, Skeleton, Stack } from '@mui/material';

import { CardGridSkeleton, CardSkeleton } from '~components';

export function DashboardSkeleton() {
  return (
    <>
      {/* Warnings slot */}
      <Stack sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
      </Stack>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 2.4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Skeleton variant="text" sx={{ fontSize: '2rem' }} width="60%" />
              <Skeleton variant="text" width="80%" />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Unit cards section */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="50%" height={16} sx={{ mb: 2 }} />
        <CardGridSkeleton count={6} md={4} />
      </Box>

      {/* Active batches + right column */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
              <Stack spacing={1.5}>
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CardSkeleton variant="widget" lines={2} sx={{ mb: 2 }} />
          <CardSkeleton variant="widget" lines={2} />
        </Grid>
      </Grid>

      {/* Most used recipes */}
      <Box sx={{ mt: 2 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="35%" height={28} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} variant="rounded" width={120} height={24} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

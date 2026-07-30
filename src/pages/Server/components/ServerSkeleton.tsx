import {
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
} from '@mui/material';

import { CardSkeleton } from '~components';

export function ServerSkeleton() {
  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start" mb={2}>
        <Skeleton variant="rounded" width={92} height={24} />
        <Skeleton variant="text" width={140} />
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardSkeleton variant="card" lines={2} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Stack spacing={0.5} flex={1}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Stack>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="text" />
              <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

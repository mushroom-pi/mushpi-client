import { Box, Button, CircularProgress, Container, Grid, Typography } from '@mui/material';

import type { PicoUnit } from '../api/generated';
import PicoUnitCard from '../components/PicoUnitCard';
import { usePicoUnits } from '../hooks/usePicoUnits';

export default function PicoUnitsPage() {
  const { data, isLoading, isError, error, refetch } = usePicoUnits({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <Container sx={{ py: 6 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography>Loading pico units…</Typography>
        </Box>
      </Container>
    );
  }
  if (isError) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography color="error">Error loading pico units: {(error as any)?.message}</Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  const items: PicoUnit[] = (data?.items ?? []) as PicoUnit[];

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pico Units</Typography>
        <Box>
          <Button variant="contained" onClick={() => refetch()}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing page {data?.page} of {data?.pages} — total: {data?.total}
      </Typography>

      <Grid container spacing={2}>
        {items.length === 0 ? (
          <Grid key="empty" size={{ xs: 12 }}>
            <Typography>No pico units</Typography>
          </Grid>
        ) : (
          items.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <PicoUnitCard pico={p} onRefresh={() => refetch()} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

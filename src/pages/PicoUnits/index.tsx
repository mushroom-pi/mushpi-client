import { Box, Button, Container, Grid, Typography } from '@mui/material';

import type { PicoUnit } from 'src/api/generated';
import { Error } from 'src/components/Error';
import { Loading } from 'src/components/Loading';
import { usePicoUnitsUI } from 'src/contexts/PicoUnitsContext';
import { useListPicoUnits } from 'src/hooks/usePicoUnits';

import PicoUnitCard from './components/PicoUnitCard';

export default function PicoUnitsPage() {
  const { page, limit, q, setPage } = usePicoUnitsUI();
  const { data, isLoading, isError, error, refetch } = useListPicoUnits({ page, limit, q });

  if (isLoading) return <Loading item="pico units" />;
  if (isError) return <Error item="pico units" error={error} />;

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

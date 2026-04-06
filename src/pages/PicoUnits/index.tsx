import { Box, Button, Grid, Typography } from '@mui/material';

import { Error, Loading } from '~components';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import PicoUnitCard from './components/PicoUnitCard';

export default function PicoUnitsPage() {
  const { units: items, isLoading, isError, error, refetch, queryData } = usePicoUnitsContext();

  if (isLoading) return <Loading item="pico units" />;
  if (isError) return <Error item="pico units" error={error} />;

  return (
    <Page>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pico Units</Typography>
        <Box>
          <Button variant="contained" onClick={() => refetch()}>
            Refresh
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing page {queryData?.page} of {queryData?.pages} — total: {queryData?.total}
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
    </Page>
  );
}

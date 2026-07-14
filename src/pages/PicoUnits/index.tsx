import { Grid, Typography } from '@mui/material';
import { useState } from 'react';

import type { PicoUnit } from '~api/generated';
import { AddNew, Error, Loading, PageTitle } from '~components';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { ConnectPicoWizard } from './components/ConnectPicoWizard';
import PicoUnitCard from './components/PicoUnitCard';
import { ReconnectPicoDialog } from './components/ReconnectPicoDialog';

export default function PicoUnitsPage() {
  const { units: items, isLoading, isError, error, refetch, queryData } = usePicoUnitsContext();
  const [connectOpen, setConnectOpen] = useState(false);
  const [reconnectUnit, setReconnectUnit] = useState<PicoUnit | null>(null);

  if (isLoading) return <Loading item="pico units" />;
  if (isError) return <Error item="pico units" error={error} />;

  return (
    <Page>
      <PageTitle
        mb={3}
        actions={
          <>
            <AddNew onClick={() => setConnectOpen(true)} sx={{ mr: 1 }}>
              Connect new Pico
            </AddNew>
          </>
        }
      >
        Pico Units
      </PageTitle>

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
              <PicoUnitCard
                pico={p}
                onRefresh={() => refetch()}
                onReconnect={setReconnectUnit}
              />
            </Grid>
          ))
        )}
      </Grid>

      <ConnectPicoWizard open={connectOpen} onClose={() => setConnectOpen(false)} />
      <ReconnectPicoDialog pico={reconnectUnit} onClose={() => setReconnectUnit(null)} />
    </Page>
  );
}

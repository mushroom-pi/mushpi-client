import { Box, Button, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Error, PageTitle } from '~components';
import { ChartsProvider } from '~ctx/Charts';
import { usePollPicoUnit } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { BuildQueryForm } from './components/BuildQueryForm';
import { ChartsTabs } from './components/ChartsTabs';
import { ReadingsSkeleton } from './components/ReadingsSkeleton';

export const ReadingsPage = () => {
  const {
    units: picoUnits,
    isLoading: isLoadingPicoUnits,
    isError,
    error,
    refetch,
    selectedUnitId,
    setSelectedUnitId,
  } = usePicoUnitsContext();

  const pollPico = usePollPicoUnit();

  useEffect(() => {
    if (selectedUnitId == null && picoUnits?.length) setSelectedUnitId(picoUnits[0].id);
  }, [picoUnits, selectedUnitId]);

  const selectedId = selectedUnitId ?? picoUnits?.[0]?.id ?? null;

  // On-mount / on-unit-change poll to get fresh readings from the Pico
  useEffect(() => {
    if (selectedId) {
      pollPico.mutate({ picoUnitId: selectedId });
    }
  }, [selectedId]);

  if (isLoadingPicoUnits) return <ReadingsSkeleton />;

  if (isError) {
    return <Error item="pico units" error={error} refetch={refetch} />;
  }

  if (!selectedId) {
    return (
      <Page>
        <PageTitle>Readings</PageTitle>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            No Pico units available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a Pico unit to start viewing readings.
          </Typography>
          <Button component={Link} to="/pico-units">
            Go to Pico Units
          </Button>
        </Box>
      </Page>
    );
  }

  return (
    <ChartsProvider initialParams={{ picoUnitId: selectedId, page: 1, limit: 500 }}>
      <Page>
        <PageTitle mb={2.5}>Readings</PageTitle>
        <BuildQueryForm />
        <ChartsTabs />
      </Page>
    </ChartsProvider>
  );
};

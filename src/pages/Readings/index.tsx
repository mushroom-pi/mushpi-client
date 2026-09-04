import { Box, Button, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { ChartsTabs, Error, PageTitle } from '~components';
import { ChartsProvider } from '~ctx/Charts';
import { usePollPicoUnit } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { BuildQueryForm } from './components/BuildQueryForm';
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
  }, [picoUnits, selectedUnitId, setSelectedUnitId]);

  const selectedId = selectedUnitId ?? picoUnits?.[0]?.id ?? null;

  // On-mount / on-unit-change poll to get fresh readings from the Pico
  // Use ref for mutate to avoid re-triggering when pollPico.isLoading changes
  const pollMutateRef = useRef(pollPico.mutate);
  pollMutateRef.current = pollPico.mutate;

  useEffect(() => {
    if (selectedId) {
      pollMutateRef.current({ picoUnitId: selectedId });
    }
  }, [selectedId]);

  let content: React.ReactNode;

  if (isLoadingPicoUnits) {
    content = <ReadingsSkeleton />;
  } else if (isError) {
    content = <Error item="pico units" error={error} refetch={refetch} />;
  } else if (!selectedId) {
    content = (
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
    );
  } else {
    content = (
      <ChartsProvider initialParams={{ picoUnitId: selectedId, points: 200 }}>
        <BuildQueryForm />
        <ChartsTabs />
      </ChartsProvider>
    );
  }

  return (
    <Page>
      <PageTitle mb={2.5}>Readings</PageTitle>
      {content}
    </Page>
  );
};

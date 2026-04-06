import { Box, Container, Stack } from '@mui/material';
import { useEffect } from 'react';

import { Loading } from '~components';
import { ChartsProvider } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { BuildQueryForm } from './components/BuildQueryForm';
import { ControlLoopCard } from './components/ChartsCards/ControlLoopCard';
import { DevicesCard } from './components/ChartsCards/DevicesCard';
import { TempHumCard } from './components/ChartsCards/TempHumCard';

export const ReadingsPage = () => {
  const {
    units: picoUnits,
    isLoading: isLoadingPicoUnits,
    selectedUnitId,
    setSelectedUnitId,
  } = usePicoUnitsContext();

  useEffect(() => {
    if (selectedUnitId == null && picoUnits?.length) setSelectedUnitId(picoUnits[0].id);
  }, [picoUnits, selectedUnitId]);

  const selectedId = selectedUnitId ?? picoUnits?.[0]?.id ?? null;

  if (isLoadingPicoUnits || !selectedId) {
    return <Loading item="pico unit" />;
  }

  return (
    <ChartsProvider initialParams={{ picoUnitId: selectedId, page: 1, limit: 250 }}>
      <Page>
        <Box>
          <BuildQueryForm />

          <Stack spacing={2}>
            <Stack direction="column" spacing={2}>
              <TempHumCard />
              <DevicesCard />
              <ControlLoopCard />
            </Stack>
          </Stack>
        </Box>
      </Page>
    </ChartsProvider>
  );
};

import { Box, Container, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { Loading } from '~comp/Loading';
import { ChartsProvider } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';

import { BuildQueryForm } from './components/BuildQueryForm';
import ControlLoopCard from './components/ControlLoopCard';
import { DevicesCard } from './components/DevicesCard';
import { TempHumCard } from './components/TempHumCard';

export const ReadingsPage = () => {
  const [picoUnitId, setPicoUnitId] = useState<number | null>(null);
  const { units: picoUnits, isLoading: isLoadingPicoUnits } = usePicoUnitsContext();

  useEffect(() => {
    if (picoUnitId == null && picoUnits?.length) setPicoUnitId(picoUnits[0].id);
  }, [picoUnits, picoUnitId]);

  const selectedId = picoUnitId ?? picoUnits?.[0]?.id ?? null;

  if (isLoadingPicoUnits || !selectedId) {
    return <Loading item="pico unit" />;
  }

  return (
    <ChartsProvider initialParams={{ picoUnitId: selectedId, page: 1, limit: 250 }}>
      <Container sx={{ py: 4 }}>
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
      </Container>
    </ChartsProvider>
  );
};

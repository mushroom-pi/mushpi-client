import { Box } from '@mui/material';
import { useEffect } from 'react';

import { Loading } from '~components';
import { ChartsProvider } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { BuildQueryForm } from './components/BuildQueryForm';
import { ChartsTabs } from './components/ChartsTabs/ChartsTabs';

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
          <ChartsTabs />
        </Box>
      </Page>
    </ChartsProvider>
  );
};

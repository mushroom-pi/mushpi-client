import { useEffect } from 'react';

import { Loading, PageTitle } from '~components';
import { ChartsProvider } from '~ctx/Charts';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { Page } from '~layout/Page';

import { BuildQueryForm } from './components/BuildQueryForm';
import { ChartsTabs } from './components/ChartsTabs';

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
    <ChartsProvider initialParams={{ picoUnitId: selectedId, page: 1, limit: 500 }}>
      <Page>
        <PageTitle mb={2.5}>Readings</PageTitle>
        <BuildQueryForm />
        <ChartsTabs />
      </Page>
    </ChartsProvider>
  );
};

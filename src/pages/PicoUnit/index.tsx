import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Error } from '~comp/Error';
import { Invalid } from '~comp/Invalid';
import { Loading } from '~comp/Loading';
import { PicoUnitProvider, usePicoUnitContext } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';

import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { PicoUnitMeta as Meta } from './components/PicoUnitMeta';

function PicoUnitDetailInner() {
  const { pico, isLoading, isError, error, refetch } = usePicoUnitContext();

  if (isLoading) return <Loading item="pico unit" />;
  if (isError || !pico) return <Error item="pico unit" refetch={refetch} error={error} />;

  return (
    <Container sx={{ py: 4 }}>
      <Meta pico={pico} />
      <DetailGrid pico={pico} />
    </Container>
  );
}

export default function PicoUnitDetail() {
  const { setSelectedUnitId } = usePicoUnitsContext();
  const { id } = useParams<{ id: string }>();
  const picoId = id ? Number(id) : null;

  if (!picoId) return <Invalid item="pico unit id" />;

  useEffect(() => {
    setSelectedUnitId(picoId);
  }, [picoId]);

  return (
    <PicoUnitProvider picoUnitId={picoId}>
      <PicoUnitDetailInner />
    </PicoUnitProvider>
  );
}

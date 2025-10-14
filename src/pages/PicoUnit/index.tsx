import { Container } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import type { PicoUnit } from 'src/api/generated';
import { Error } from 'src/components/Error';
import { Invalid } from 'src/components/Invalid';
import { Loading } from 'src/components/Loading';
import { useGetPicoUnit } from 'src/hooks/usePicoUnits';

import { PicoUnitDeleteDialog as DeleteDialog } from './components/PicoUnitDeleteDialog';
import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { PicoUnitHeader as Header } from './components/PicoUnitHeader';

export default function PicoUnitDetail() {
  const { id } = useParams<{ id: string }>();
  const picoId = id ? Number(id) : null;

  if (!picoId) return <Invalid item="pico unit id" />;

  const { data, isLoading, isError, error, refetch } = useGetPicoUnit(picoId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <Loading item="pico unit" />;
  if (isError || !data) return <Error item="pico unit" refetch={refetch} error={error} />;

  const pico: PicoUnit = data;

  return (
    <Container sx={{ py: 4 }}>
      <Header pico={pico} refetch={refetch} setDeleteOpen={setDeleteOpen} />
      <DetailGrid pico={pico} refetch={refetch} />
      <DeleteDialog deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} pico={pico} />
    </Container>
  );
}

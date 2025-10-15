import { Container } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Error } from 'src/components/Error';
import { Invalid } from 'src/components/Invalid';
import { Loading } from 'src/components/Loading';
import { PicoUnitProvider, usePicoUnitContext } from 'src/contexts/PicoUnitContext';

import { PicoUnitDeleteDialog as DeleteDialog } from './components/PicoUnitDeleteDialog';
import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { PicoUnitEditModal as EditModal } from './components/PicoUnitEditModal';
import { PicoUnitHeader as Header } from './components/PicoUnitHeader';

function PicoUnitDetailInner() {
  const { pico, isLoading, isError, error, refetch } = usePicoUnitContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <Loading item="pico unit" />;
  if (isError || !pico) return <Error item="pico unit" refetch={refetch} error={error} />;

  return (
    <Container sx={{ py: 4 }}>
      <Header setEditOpen={setEditOpen} setDeleteOpen={setDeleteOpen} />
      <DetailGrid pico={pico} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteDialog deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} pico={pico} />
    </Container>
  );
}

export default function PicoUnitDetail() {
  const { id } = useParams<{ id: string }>();
  const picoId = id ? Number(id) : null;

  if (!picoId) return <Invalid item="pico unit id" />;

  return (
    <PicoUnitProvider picoUnitId={picoId}>
      <PicoUnitDetailInner />
    </PicoUnitProvider>
  );
}

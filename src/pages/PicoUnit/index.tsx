import { Box, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { Error, Invalid, ItemPage, Loading } from '~components';
import { PicoUnitProvider, usePicoUnitContext } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';

import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { DeletePicoUnit } from './components/PicoUnitMeta/DeletePicoUnit';
import { EditMetaDialog } from './components/PicoUnitMeta/EditMetaDialog';
import { MetaButtons } from './components/PicoUnitMeta/MetaButtons';

function PicoUnitDetailInner() {
  const { pico, isLoading, isError, error, refetch } = usePicoUnitContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { openEditDialog?: boolean })?.openEditDialog) {
      setEditOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  if (isLoading) return <Loading item="pico unit" />;
  if (isError || !pico) return <Error item="pico unit" refetch={refetch} error={error} />;

  return (
    <ItemPage
      title={pico.name ?? 'No name'}
      actions={<MetaButtons setEditOpen={setEditOpen} setDeleteOpen={setDeleteOpen} />}
      meta={
        <>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Chip
              label={pico.enabled ? 'Enabled' : 'Disabled'}
              color={pico.enabled ? 'info' : 'default'}
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              {pico.handle ?? ''}
            </Typography>
          </Stack>
          <Box mb={3}>
            <Typography variant="body2">{pico.description ?? 'No description'}</Typography>
          </Box>
        </>
      }
    >
      <DetailGrid pico={pico} />
      <EditMetaDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeletePicoUnit open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </ItemPage>
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

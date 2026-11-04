import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { PicoUnit } from '~api/generated';
import {
  Error,
  FirmwareCompatBadge,
  Invalid,
  ItemPage,
  ReconnectPicoDialog,
  UnitHealthIcon,
} from '~components';
import { PicoUnitProvider, usePicoUnitContext } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useDocumentTitle } from '~hook/useDocumentTitle';
import { compatibilityStatus } from '~utils/pico';

import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { PicoUnitDetailSkeleton } from './components/PicoUnitDetailSkeleton';
import { DeletePicoUnit } from './components/PicoUnitMeta/DeletePicoUnit';
import { EditMetaDialog } from './components/PicoUnitMeta/EditMetaDialog';
import { MetaButtons } from './components/PicoUnitMeta/MetaButtons';
import { RebootPicoDialog } from './components/PicoUnitMeta/RebootPicoDialog';
import { PicoUnitStatCards } from './components/PicoUnitStatCards';

function PicoUnitDetailInner() {
  const { pico, isLoading, isError, error, refetch, pollPico } = usePicoUnitContext();
  const { id } = useParams<{ id: string }>();
  useDocumentTitle(pico?.name ?? (id ? `Pico Unit #${id}` : 'Pico Unit'));
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rebootOpen, setRebootOpen] = useState(false);
  const [reconnectPico, setReconnectPico] = useState<PicoUnit | null>(null);
  const location = useLocation();
  const openEditDialog = (location.state as { openEditDialog?: boolean })?.openEditDialog;

  useEffect(() => {
    if (openEditDialog) {
      setEditOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [openEditDialog]);

  // On-mount poll to get fresh readings from the Pico
  // Use ref for mutate to avoid re-triggering when pollPico.isLoading changes
  const pollMutateRef = useRef(pollPico.mutate);
  pollMutateRef.current = pollPico.mutate;

  useEffect(() => {
    if (pico?.id) {
      pollMutateRef.current({ picoUnitId: pico.id });
    }
  }, [pico?.id]);

  if (isLoading) return <PicoUnitDetailSkeleton />;
  if (isError || !pico) return <Error item="pico unit" refetch={refetch} error={error} />;

  return (
    <>
      {pollPico.isLoading && <LinearProgress />}
      <ItemPage
        title={pico.name ?? 'No name'}
        titleAdornment={<UnitHealthIcon status={pico.status} />}
        actions={
          <MetaButtons
            setEditOpen={setEditOpen}
            setDeleteOpen={setDeleteOpen}
            onReconnect={() => setReconnectPico(pico)}
            onRebootPico={() => setRebootOpen(true)}
          />
        }
        meta={
          <>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Chip
                label={
                  pico.status === 'healthy'
                    ? 'Healthy'
                    : pico.status === 'degraded'
                      ? 'Degraded'
                      : pico.status === 'offline'
                        ? 'Offline'
                        : 'Paused'
                }
                color={
                  pico.status === 'healthy'
                    ? 'success'
                    : pico.status === 'degraded'
                      ? 'warning'
                      : pico.status === 'offline'
                        ? 'error'
                        : 'default'
                }
                size="small"
              />
              {/* warning-only compatibility chip (server-owned verdict); renders nothing
                  unless incompatible — kept out of the titleAdornment, which UnitHealthIcon owns */}
              <FirmwareCompatBadge
                status={compatibilityStatus(pico)}
                apiVersion={pico.api_version}
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
        <PicoUnitStatCards pico={pico} isPolling={pollPico.isLoading} />
        <DetailGrid pico={pico} />
        <EditMetaDialog open={editOpen} onClose={() => setEditOpen(false)} />
        <DeletePicoUnit open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        <RebootPicoDialog
          open={rebootOpen}
          onClose={() => setRebootOpen(false)}
          picoUnitId={pico.id}
          isOffline={pico.status === 'offline'}
        />
        <ReconnectPicoDialog pico={reconnectPico} onClose={() => setReconnectPico(null)} />
      </ItemPage>
    </>
  );
}

export default function PicoUnitDetail() {
  const { setSelectedUnitId } = usePicoUnitsContext();
  const { id } = useParams<{ id: string }>();
  const picoId = id ? Number(id) : null;

  useEffect(() => {
    if (picoId) setSelectedUnitId(picoId);
  }, [picoId, setSelectedUnitId]);

  if (!picoId) return <Invalid item="pico unit id" />;

  return (
    <PicoUnitProvider picoUnitId={picoId}>
      <PicoUnitDetailInner />
    </PicoUnitProvider>
  );
}

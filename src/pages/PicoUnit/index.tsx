import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { PicoUnit } from '~api/generated';
import { DeviationAlert, HUMIDITY_DEVIATION_THRESHOLD, TEMP_DEVIATION_THRESHOLD } from '~components';
import { Error, Invalid, ItemPage, UnitHealthIcon } from '~components';
import { PicoUnitProvider, usePicoUnitContext } from '~ctx/PicoUnit';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { ReconnectPicoDialog } from '~pages/PicoUnits/components/ReconnectPicoDialog';

import { PicoUnitDetailGrid as DetailGrid } from './components/PicoUnitDetailGrid';
import { PicoUnitDetailSkeleton } from './components/PicoUnitDetailSkeleton';
import { DeletePicoUnit } from './components/PicoUnitMeta/DeletePicoUnit';
import { EditMetaDialog } from './components/PicoUnitMeta/EditMetaDialog';
import { MetaButtons } from './components/PicoUnitMeta/MetaButtons';
import { PicoUnitStatCards } from './components/PicoUnitStatCards';

function PicoUnitDetailInner() {
  const { pico, isLoading, isError, error, refetch, pollPico } = usePicoUnitContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reconnectPico, setReconnectPico] = useState<PicoUnit | null>(null);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { openEditDialog?: boolean })?.openEditDialog) {
      setEditOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  // On-mount poll to get fresh readings from the Pico
  useEffect(() => {
    if (pico?.id) {
      pollPico.mutate({ picoUnitId: pico.id });
    }
  }, [pico?.id]);

  if (isLoading) return <PicoUnitDetailSkeleton />;
  if (isError || !pico) return <Error item="pico unit" refetch={refetch} error={error} />;

  const reading = pico.latest_reading as Record<string, unknown> | null;
  const controlLoopEnabled = reading?.control_loop_enabled === true;
  const temp = reading?.temperature as number | null | undefined;
  const tempSet = reading?.temperature_set as number | null | undefined;
  const humidity = reading?.humidity as number | null | undefined;
  const humiditySet = reading?.humidity_set as number | null | undefined;

  const tempDeviation =
    controlLoopEnabled &&
    temp != null &&
    tempSet != null &&
    Math.abs(temp - tempSet) > TEMP_DEVIATION_THRESHOLD;

  const humidityDeviation =
    controlLoopEnabled &&
    humidity != null &&
    humiditySet != null &&
    Math.abs(humidity - humiditySet) > HUMIDITY_DEVIATION_THRESHOLD;

  return (
    <>
      {pollPico.isLoading && <LinearProgress />}
      <ItemPage
        title={pico.name ?? 'No name'}
        titleAdornment={<UnitHealthIcon pico={pico} />}
        actions={
          <MetaButtons
            setEditOpen={setEditOpen}
            setDeleteOpen={setDeleteOpen}
            onReconnect={() => setReconnectPico(pico)}
          />
        }
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
        {(tempDeviation || humidityDeviation) && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {tempDeviation && temp != null && tempSet != null && (
              <DeviationAlert
                type="temp"
                actualValue={temp}
                targetValue={tempSet}
                variant="filled"
              />
            )}
            {humidityDeviation && humidity != null && humiditySet != null && (
              <DeviationAlert
                type="humidity"
                actualValue={humidity}
                targetValue={humiditySet}
                variant="filled"
              />
            )}
          </Stack>
        )}
        <PicoUnitStatCards pico={pico} isPolling={pollPico.isLoading} />
        <DetailGrid pico={pico} />
        <EditMetaDialog open={editOpen} onClose={() => setEditOpen(false)} />
        <DeletePicoUnit open={deleteOpen} onClose={() => setDeleteOpen(false)} />
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
  }, [picoId]);

  if (!picoId) return <Invalid item="pico unit id" />;

  return (
    <PicoUnitProvider picoUnitId={picoId}>
      <PicoUnitDetailInner />
    </PicoUnitProvider>
  );
}

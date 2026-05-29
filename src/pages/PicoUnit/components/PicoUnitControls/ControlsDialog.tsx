import TuneIcon from '@mui/icons-material/Tune';
import { Alert, Box, Grid, Slider, Stack, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { ChangeSetPointsDto, ControlLoopDto } from '~api/generated';
import { HeaderAndIcon, OnOffInput, PicoUnitForm } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import type { DialogProps } from '~int/dialogProps';

export const ControlsDialog: React.FC<DialogProps> = ({ open, onClose, closeOnSave = true }) => {
  const { pico, changeTargets, toggleControlLoop } = usePicoUnitContext();
  const { run } = useAsyncWithToast();
  if (!pico || !pico.latest_reading) return;

  const { latest_reading: lr } = pico;
  const isSaving = changeTargets?.isLoading && toggleControlLoop?.isLoading;

  const [enabled, setEnabled] = useState<boolean>(lr.control_loop_enabled);
  const [targetTemp, setTargetTemp] = useState<number | null>(lr.temperature_set ?? null);
  const [targetHum, setTargetHum] = useState<number | null>(lr.humidity_set ?? null);

  useEffect(() => {
    if (!open) return;
    if (!pico || !lr) {
      setEnabled(false);
      setTargetTemp(null);
      setTargetHum(null);
      return;
    }
    setEnabled(lr.control_loop_enabled);
    setTargetTemp(lr.temperature_set ?? null);
    setTargetHum(lr.humidity_set ?? null);
  }, [open, lr.control_loop_enabled, lr.temperature_set, lr.humidity_set]);

  const changesControlLoop = useMemo(() => {
    if (!pico || !lr) return false;
    return enabled !== lr.control_loop_enabled;
  }, [pico, enabled]);

  const changesTargets = useMemo(() => {
    if (!pico || !lr) return false;
    return targetTemp !== lr.temperature_set || targetHum !== lr.humidity_set;
  }, [pico, targetHum, targetTemp]);

  const hasChanges = useMemo(() => {
    if (!pico || !lr) return false;
    return changesTargets || changesControlLoop;
  }, [pico, changesTargets, changesControlLoop]);

  async function doSaveChanges() {
    if (!pico || !lr) return;
    const toggleControlLoopBody: ControlLoopDto = { enabled };
    const changeTargetsBody: ChangeSetPointsDto = {
      temperature: targetTemp ?? undefined,
      humidity: targetHum ?? undefined,
    };

    await run(
      () => {
        const promises = [];
        if (changesControlLoop)
          promises.push(
            toggleControlLoop?.mutateAsync({ picoUnitId: pico.id, body: toggleControlLoopBody }),
          );
        if (changesTargets)
          promises.push(
            changeTargets?.mutateAsync({ picoUnitId: pico.id, body: changeTargetsBody }),
          );
        return Promise.all(promises);
      },
      {
        successMessage: "Pico unit's controls changed successfully",
        fallbackErrorMessage: "Failed to change the pico unit's controls",
        onSuccess: () => {
          if (closeOnSave) onClose();
        },
      },
    );
  }

  function handleCancel() {
    if (pico && lr) {
      setEnabled(lr.control_loop_enabled ?? true);
      setTargetTemp(lr.temperature_set ?? null);
      setTargetHum(lr.humidity_set ?? null);
    } else {
      setEnabled(true);
      setTargetTemp(null);
      setTargetHum(null);
    }
    onClose();
  }

  return (
    open && (
      <PicoUnitForm
        open={open}
        onClose={handleCancel}
        onSubmit={doSaveChanges}
        canSubmit={hasChanges}
        isPending={isSaving}
        title={<HeaderAndIcon title="Controls" icon={<TuneIcon />} />}
      >
        <Alert
          severity={enabled ? 'info' : 'warning'}
          variant="outlined"
          sx={{ m: 1, mb: 2, borderRadius: 2 }}
        >
          {enabled
            ? 'While the control loop is on, the unit will turn devices on and/or off automatically to try to meet the targets.'
            : "With the control loop off, the devices have to be turned on and/or off manually, as the unit won't automatically try to reach the targets."}
        </Alert>
        <Stack spacing={2} m={1}>
          <OnOffInput label="Control loop" value={!!enabled} setter={setEnabled} />

          {/* Temperature */}
          <Grid container alignItems="center" columnSpacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Target temperature</Typography>
            </Grid>

            <Grid size={8}>
              <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', px: 1 }} mt={2}>
                <Slider
                  aria-label="Target temperature"
                  value={targetTemp ?? 20}
                  step={1}
                  min={0}
                  max={50}
                  size="medium"
                  valueLabelDisplay="on"
                  onChange={(_, value) => setTargetTemp(value as number)}
                  disabled={!enabled}
                  marks={[
                    {
                      value: 0,
                      label: '0°C',
                    },
                    {
                      value: 50,
                      label: '50°C',
                    },
                  ]}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Humidity */}
          <Grid container alignItems="center" columnSpacing={2} mt={2}>
            <Grid size={4}>
              <Typography variant="body2">Target humidity</Typography>
            </Grid>

            <Grid size={8}>
              <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', px: 1 }}>
                <Slider
                  aria-label="Target humidity"
                  value={targetHum ?? 50}
                  step={5}
                  min={20}
                  max={90}
                  size="medium"
                  valueLabelDisplay="on"
                  onChange={(_, value) => setTargetHum(value as number)}
                  disabled={!enabled}
                  marks={[
                    {
                      value: 20,
                      label: '20%',
                    },
                    {
                      value: 90,
                      label: '90%',
                    },
                  ]}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </PicoUnitForm>
    )
  );
};

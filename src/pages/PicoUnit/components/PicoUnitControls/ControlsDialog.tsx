import TuneIcon from '@mui/icons-material/Tune';
import { Box, Grid, Slider, Stack, Switch, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { ChangeSetPointsDto, ControlLoopDto } from '~api/generated';
import { HeaderAndIcon } from '~comp/HeaderAndIcon';
import { Loading } from '~comp/Loading';
import { ModalDialog } from '~comp/ModalDialog';
import { usePicoUnitContext } from '~ctx/PicoUnit';

interface ControlsDialogProps {
  open: boolean;
  onClose: () => void;
  closeOnSave?: boolean;
}

export const ControlsDialog: React.FC<ControlsDialogProps> = ({
  open,
  onClose,
  closeOnSave = true,
}) => {
  const { pico, changeTargets, toggleControlLoop } = usePicoUnitContext();
  if (!pico || !pico.latest_reading) return <Loading />;

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

    try {
      if (changesControlLoop)
        await toggleControlLoop?.mutateAsync({ picoUnitId: pico.id, body: toggleControlLoopBody });
      if (changesTargets)
        await changeTargets?.mutateAsync({ picoUnitId: pico.id, body: changeTargetsBody });

      if (closeOnSave) onClose();
    } catch (error) {
      console.error('Failed to update pico unit', error);
    }
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
      <ModalDialog
        open={open}
        onClose={onClose}
        doSaveChanges={doSaveChanges}
        handleCancel={handleCancel}
        hasChanges={hasChanges}
        isSaving={isSaving}
        headerAndIcon={<HeaderAndIcon title="Controls" icon={<TuneIcon />} />}
      >
        <Stack spacing={2} width="100%" mt={0.5}>
          {/* Two-column layout: left = label, right = control */}
          <Grid container alignItems="center" columnSpacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Control loop</Typography>
            </Grid>
            <Grid size={8}>
              <Box display="flex" justifyContent="flex-start" alignItems="center">
                <Switch
                  checked={!!enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  inputProps={{ 'aria-label': 'enabled-toggle' }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Temperature */}
          <Grid container alignItems="center" columnSpacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Target temperature</Typography>
            </Grid>

            <Grid size={8}>
              <Box>
                <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', px: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 32 }}>
                    0 °C
                  </Typography>

                  <Box sx={{ flex: 1 }}>
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
                    />
                  </Box>

                  <Typography variant="body2" sx={{ minWidth: 36 }}>
                    50 °C
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Humidity */}
          <Grid container alignItems="center" columnSpacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Target humidity</Typography>
            </Grid>

            <Grid size={8}>
              <Box>
                <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', px: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 32 }}>
                    20%{/* left min label */}
                  </Typography>

                  <Box sx={{ flex: 1 }}>
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
                    />
                  </Box>

                  <Typography variant="body2" sx={{ minWidth: 36 }}>
                    90%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </ModalDialog>
    )
  );
};

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { ChangeSetPointsDto, ControlLoopDto } from '~api/generated';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnit';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  closeOnSave?: boolean;
  label: string;
  children: React.ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  closeOnSave = true,
  label,
  children,
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="pico-edit-dialog-title"
    >
      <DialogTitle display="flex" alignItems="center" justifyContent="space-between">
        <Typography id="pico-edit-dialog-title" variant="h6">
          {label}
        </Typography>
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!pico ? (
          <Box py={2}>
            <Typography variant="body2">No pico selected</Typography>
          </Box>
        ) : (
          <Stack spacing={2} width="100%" mt={0.5}>
            {children}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={doSaveChanges}
          disabled={isSaving || (!changesTargets && !changesControlLoop) || !pico}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { UpdatePicoUnitDto } from '~api/generated';
import { HeaderAndIcon } from '~comp/HeaderAndIcon';
import { ModalDialog } from '~comp/ModalDialog';
import { usePicoUnitContext } from '~ctx/PicoUnit';

interface PicoUnitEditModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * If true the modal will automatically close after a successful save.
   * Default: true
   */
  closeOnSave?: boolean;
}

export const PicoUnitEditModal: React.FC<PicoUnitEditModalProps> = ({
  open,
  onClose,
  closeOnSave = true,
}) => {
  const { pico, updatePico: updateMutation } = usePicoUnitContext();

  // local editable state
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editEnabled, setEditEnabled] = useState<boolean>(false);

  // initialize/reset inputs whenever the dialog opens or pico changes
  useEffect(() => {
    if (!open) return; // only initialize when opening
    if (!pico) {
      setEditName('');
      setEditDescription('');
      setEditEnabled(false);
      return;
    }
    setEditName(pico.name ?? '');
    setEditDescription(pico.description ?? '');
    setEditEnabled(!!pico.enabled);
  }, [open, pico?.id, pico?.name, pico?.description, pico?.enabled]);

  // detect changes to enable/disable Save button
  const hasChanges = useMemo(() => {
    if (!pico) return false;
    return (
      (editName ?? '') !== (pico.name ?? '') ||
      (editDescription ?? '') !== (pico.description ?? '') ||
      !!editEnabled !== !!pico.enabled
    );
  }, [pico, editName, editDescription, editEnabled]);

  async function doSaveEdits() {
    if (!pico) return;
    const body: UpdatePicoUnitDto = {
      name: editName,
      description: editDescription,
      enabled: !!editEnabled,
    };

    try {
      await updateMutation.mutateAsync({ picoUnitId: pico.id, body });
      if (closeOnSave) {
        onClose();
      } else {
        // re-sync inputs from pico in case provider updated it
        // provider's optimistic update will usually make this unnecessary,
        // but keeping parity with original behavior.
        // (If pico in context updates, our open-effect will re-sync.)
      }
    } catch (err) {
      // TODO: show a friendly toast/snackbar here (not included).
      console.error('Failed to update pico unit', err);
    }
  }

  // Cancel handler resets local fields to pico values and closes
  function handleCancel() {
    if (pico) {
      setEditName(pico.name ?? '');
      setEditDescription(pico.description ?? '');
      setEditEnabled(!!pico.enabled);
    } else {
      setEditName('');
      setEditDescription('');
      setEditEnabled(false);
    }
    onClose();
  }

  return (
    <ModalDialog
      open={open}
      hasChanges={hasChanges}
      isSaving={updateMutation.isLoading}
      onClose={onClose}
      doSaveChanges={doSaveEdits}
      handleCancel={handleCancel}
      headerAndIcon={<HeaderAndIcon title="Edit Pico Details" />}
    >
      <Stack spacing={2} sx={{ width: '100%', mt: 0.5 }}>
        <TextField
          label="Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">Enabled</Typography>
          <Switch
            checked={!!editEnabled}
            onChange={(e) => setEditEnabled(e.target.checked)}
            inputProps={{ 'aria-label': 'enabled-toggle' }}
          />
        </Box>
      </Stack>
    </ModalDialog>
  );
};

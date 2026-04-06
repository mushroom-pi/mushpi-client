import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { UpdatePicoUnitDto } from '~api/generated';
import { HeaderAndIcon, ModalDialog } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

interface EditMetaDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * If true the modal will automatically close after a successful save.
   * Default: true
   */
  closeOnSave?: boolean;
}

export const EditMetaDialog: React.FC<EditMetaDialogProps> = ({
  open,
  onClose,
  closeOnSave = true,
}) => {
  const { pico, updatePico: updateMutation } = usePicoUnitContext();
  const { run } = useAsyncWithToast();

  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editEnabled, setEditEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
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

    await run(() => updateMutation.mutateAsync({ picoUnitId: pico.id, body }), {
      successMessage: 'Pico unit details updated successfully',
      fallbackErrorMessage: 'Failed to update pico unit details',
      onSuccess: () => {
        if (closeOnSave) onClose();
      },
    });
  }

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
    open && (
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
    )
  );
};

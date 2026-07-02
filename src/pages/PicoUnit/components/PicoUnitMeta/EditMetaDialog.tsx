import { Box, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { UpdatePicoUnitDto } from '~api/generated';
import { schemas } from '~api/generated/schemas';
import { ColorSwatchPicker, HeaderAndIcon, PicoUnitForm } from '~components';
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
  const [editFaceColor, setEditFaceColor] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!pico) {
      setEditName('');
      setEditDescription('');
      setEditEnabled(false);
      setEditFaceColor(null);
      return;
    }
    setEditName(pico.name ?? '');
    setEditDescription(pico.description ?? '');
    setEditEnabled(!!pico.enabled);
    setEditFaceColor(pico.face_color ?? null);
  }, [open, pico?.id, pico?.name, pico?.description, pico?.enabled, pico?.face_color]);

  // detect changes to enable/disable Save button
  const hasChanges = useMemo(() => {
    if (!pico) return false;
    return (
      (editName ?? '') !== (pico.name ?? '') ||
      (editDescription ?? '') !== (pico.description ?? '') ||
      !!editEnabled !== !!pico.enabled ||
      (editFaceColor ?? null) !== (pico.face_color ?? null)
    );
  }, [pico, editName, editDescription, editEnabled, editFaceColor]);

  const errors = useMemo(() => {
    const result = schemas.UpdatePicoUnitDto.safeParse({
      name: editName,
      description: editDescription,
      face_color: editFaceColor,
    });
    if (!result.success) {
      return {
        name: result.error.issues.find((i) => i.path[0] === 'name')?.message,
        description: result.error.issues.find((i) => i.path[0] === 'description')?.message,
        faceColor: result.error.issues.find((i) => i.path[0] === 'face_color')?.message,
      };
    }
    return {};
  }, [editName, editDescription, editFaceColor]);

  async function doSaveEdits() {
    if (!pico) return;
    const body: UpdatePicoUnitDto = {
      name: editName,
      description: editDescription,
      enabled: !!editEnabled,
      face_color: editFaceColor,
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
      setEditFaceColor(pico.face_color ?? null);
    } else {
      setEditName('');
      setEditDescription('');
      setEditEnabled(false);
      setEditFaceColor(null);
    }
    onClose();
  }

  return (
    open && (
      <PicoUnitForm
        open={open}
        canSubmit={hasChanges && !Object.values(errors).some(Boolean)}
        isPending={updateMutation.isLoading}
        onClose={handleCancel}
        onSubmit={doSaveEdits}
        title={<HeaderAndIcon title="Edit Pico Details" />}
      >
        <Stack spacing={2} sx={{ width: '100%', mt: 0.5 }}>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            error={!!errors.name}
            helperText={errors.name ?? undefined}
          />

          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            error={!!errors.description}
            helperText={errors.description ?? undefined}
          />

          <Box>
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>
              Face color
            </Typography>
            <ColorSwatchPicker value={editFaceColor} onChange={setEditFaceColor} />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">Enabled</Typography>
            <Switch
              checked={!!editEnabled}
              onChange={(e) => setEditEnabled(e.target.checked)}
              inputProps={{ 'aria-label': 'enabled-toggle' }}
            />
          </Box>
        </Stack>
      </PicoUnitForm>
    )
  );
};

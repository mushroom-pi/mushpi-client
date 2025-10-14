import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { PicoUnit, UpdatePicoUnitDto } from 'src/api/generated';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';

interface PicoUnitEditableInfoProps {
  pico?: PicoUnit;
}

export const PicoUnitEditableInfo: React.FC<PicoUnitEditableInfoProps> = ({ pico: dataProp }) => {
  // Prefer reading pico from context (provider must wrap component)
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  // Use the provider's mutation state for loading
  const updateMutation = ctx.updatePico;
  const isSaving = updateMutation.isLoading;

  // local editable state (initialized from pico)
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editEnabled, setEditEnabled] = useState<boolean>(false);

  // sync local inputs when pico changes (initial load, optimistic updates, or rollback)
  useEffect(() => {
    if (!pico) return;
    setEditName(pico.name ?? '');
    setEditDescription(pico.description ?? '');
    setEditEnabled(!!pico.enabled);
  }, [pico?.id, pico?.name, pico?.description, pico?.enabled]);

  // detect if anything changed so we can disable Save when no-op
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
      // provider handles optimistic updates and final invalidation/refresh
      await updateMutation.mutateAsync({ picoUnitId: pico.id, body });
    } catch (err) {
      // TODO: show a friendly toast/snackbar here (not included).
      // console log so errors don't silently swallow
      console.error('Failed to update pico unit', err);
    }
  }

  if (!pico) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Details (editable)</Typography>
          <Typography variant="body2">No pico selected</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Details (editable)
        </Typography>

        <Stack spacing={2}>
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

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                // reset to original values from pico
                setEditName(pico.name ?? '');
                setEditDescription(pico.description ?? '');
                setEditEnabled(!!pico.enabled);
              }}
              disabled={isSaving || !hasChanges}
            >
              Cancel
            </Button>

            <Button variant="contained" onClick={doSaveEdits} disabled={isSaving || !hasChanges}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

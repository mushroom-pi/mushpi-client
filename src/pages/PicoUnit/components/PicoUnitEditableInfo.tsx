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
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import type { PicoUnit, UpdatePicoUnitDto } from 'src/api/generated';
import { useUpdatePicoUnit } from 'src/hooks/usePicoUnits';

interface PicoUnitEditableInfoProps {
  data: PicoUnit;
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<PicoUnit, unknown>>;
}

export const PicoUnitEditableInfo: React.FC<PicoUnitEditableInfoProps> = ({ data, refetch }) => {
  const updateMutation = useUpdatePicoUnit();

  const [saving, setSaving] = useState(false);

  // editable fields state (initialize from data when loaded)
  const [editName, setEditName] = useState<string | undefined>(undefined);
  const [editDescription, setEditDescription] = useState<string | undefined>(undefined);
  const [editEnabled, setEditEnabled] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setEditName(data.name ?? '');
      setEditDescription(data.description ?? '');
      setEditEnabled(!!data.enabled);
    }
  }, [data]);

  const pico: PicoUnit = data;

  async function doSaveEdits() {
    if (!pico) return;
    const body: UpdatePicoUnitDto = {
      name: editName,
      description: editDescription,
      enabled: !!editEnabled,
    };

    setSaving(true);
    try {
      await updateMutation.mutateAsync({ picoUnitId: pico.id, body });
      await refetch();
    } finally {
      setSaving(false);
    }
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
            value={editName ?? ''}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={editDescription ?? ''}
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
              disabled={saving}
              onClick={() => {
                // reset to original values
                setEditName(pico.name ?? '');
                setEditDescription(pico.description ?? '');
                setEditEnabled(!!pico.enabled);
              }}
            >
              Cancel
            </Button>

            <Button variant="contained" onClick={doSaveEdits} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

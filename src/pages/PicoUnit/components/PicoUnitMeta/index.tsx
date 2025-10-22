import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { DeleteDialog } from './DeleteDialog';
import { EditMetaDialog } from './EditMetaDialog';
import { MetaInfo } from './MetaInfo';

export const PicoUnitMeta: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const navigate = useNavigate();
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  // Defensive: if provider not ready yet, render a small placeholder
  if (!pico) {
    return (
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
            Loading…
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Loading" size="small" />
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>
      </Box>
    );
  }

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  return (
    <Box>
      <MetaInfo setEditOpen={setEditOpen} setDeleteOpen={setDeleteOpen} />
      <EditMetaDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </Box>
  );
};

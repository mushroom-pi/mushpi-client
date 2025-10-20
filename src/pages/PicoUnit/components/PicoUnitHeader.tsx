import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

type PicoUnitHeaderProps = OptionalPicoUnitProps & {
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
};

/**
 * Header for the Pico Unit detail page.
 * - Reads pico & refetch from PicoUnitProvider via usePicoUnitContext()
 * - Controls the delete dialog via setDeleteOpen prop (parent keeps dialog state)
 */
export const PicoUnitHeader: React.FC<PicoUnitHeaderProps> = ({
  setDeleteOpen,
  setEditOpen,
  pico: dataProp,
}) => {
  const navigate = useNavigate();
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;
  const { isLoading, refetch } = ctx;

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

  const { enabled } = pico;

  return (
    <Box>
      <Box></Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
            {pico.name ?? 'No name'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => refetch()} disabled={isLoading} aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>

          <Button
            color="secondary"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start" mb={2}>
        <Chip
          label={enabled ? 'Enabled' : 'Disabled'}
          color={enabled ? 'info' : 'default'}
          size="small"
        />
        <Typography variant="subtitle2" color="text.secondary">
          {pico.handle ?? ''}
        </Typography>
      </Stack>

      <Box mb={3}>
        <Typography variant="body2">{pico.description ?? 'No description'}</Typography>
      </Box>
    </Box>
  );
};

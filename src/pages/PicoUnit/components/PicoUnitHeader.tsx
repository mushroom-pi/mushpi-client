import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import type { PicoUnit } from 'src/api/generated';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';

interface PicoUnitHeaderProps {
  pico?: PicoUnit;
  setDeleteOpen: (open: boolean) => void;
}

/**
 * Header for the Pico Unit detail page.
 * - Reads pico & refetch from PicoUnitProvider via usePicoUnitContext()
 * - Controls the delete dialog via setDeleteOpen prop (parent keeps dialog state)
 */
export const PicoUnitHeader: React.FC<PicoUnitHeaderProps> = ({
  setDeleteOpen,
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
        <Box display="flex" gap={1} alignItems="center">
          <Chip label="Loading" size="small" />
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  const controlLoopEnabled = !!pico.latest_reading?.control_loop_enabled;
  const failedCalls = pico.failed_calls;

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Box>
        <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
          {pico.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {pico.handle ?? ''}
        </Typography>
      </Box>

      <Box display="flex" gap={1} alignItems="center">
        <Chip
          label={controlLoopEnabled ? 'Control Loop Enabled' : 'Control Loop Disabled'}
          color={controlLoopEnabled ? 'success' : 'default'}
          size="small"
        />

        {typeof failedCalls !== 'undefined' && (
          <Chip
            label={`Failed: ${failedCalls}`}
            color={failedCalls > 3 ? 'warning' : 'default'}
            size="small"
          />
        )}

        <Tooltip title="Refresh">
          <span>
            {/* span to avoid tooltip warnings when child is disabled */}
            <IconButton onClick={() => refetch()} disabled={isLoading} aria-label="refresh">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>

        <Button
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

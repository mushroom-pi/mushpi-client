import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

import type { PicoUnit } from 'src/api/generated';

interface PicoUnitHeaderProps {
  pico: PicoUnit;
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<PicoUnit, unknown>>;
  setDeleteOpen: (arg: boolean) => void;
}

export const PicoUnitHeader: React.FC<PicoUnitHeaderProps> = ({ pico, refetch, setDeleteOpen }) => {
  const navigate = useNavigate();

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
          label={
            pico.latest_reading?.control_loop_enabled
              ? 'Control Loop Enabled'
              : 'Control Loop Disabled'
          }
          color={pico.latest_reading?.control_loop_enabled ? 'success' : 'default'}
          size="small"
        />
        {pico.failed_calls !== undefined && (
          <Chip
            label={`Failed: ${pico.failed_calls}`}
            color={pico.failed_calls > 3 ? 'warning' : 'default'}
            size="small"
          />
        )}
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()}>
            <RefreshIcon />
          </IconButton>
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

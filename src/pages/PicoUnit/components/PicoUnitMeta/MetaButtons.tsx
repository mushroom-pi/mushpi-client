import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { DeleteButton, EditButton } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { isUnitOffline } from '~utils/pico';

type MetaButtonsProps = {
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  onReconnect: () => void;
  onRebootPico: () => void;
};

export const MetaButtons: React.FC<MetaButtonsProps> = ({
  setDeleteOpen,
  setEditOpen,
  onReconnect,
  onRebootPico,
}) => {
  const navigate = useNavigate();
  const { isLoading, refetch, pico } = usePicoUnitContext();

  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
      <Tooltip title="Refresh">
        <span>
          <IconButton onClick={() => refetch()} disabled={isLoading} aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Back
        </Box>
      </Button>

      <Button
        color="info"
        variant="outlined"
        startIcon={<ShowChartIcon />}
        onClick={() => navigate('/readings')}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Readings
        </Box>
      </Button>

      {pico && isUnitOffline(pico) && (
        <Button
          color="warning"
          variant="outlined"
          startIcon={<WifiTetheringIcon />}
          onClick={onReconnect}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Reconnect
          </Box>
        </Button>
      )}

      {pico?.enabled && (
        <Button
          color="warning"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onRebootPico}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Reboot
          </Box>
        </Button>
      )}

      <EditButton onClick={() => setEditOpen(true)} />
      <DeleteButton onClick={() => setDeleteOpen(true)} />
    </Stack>
  );
};

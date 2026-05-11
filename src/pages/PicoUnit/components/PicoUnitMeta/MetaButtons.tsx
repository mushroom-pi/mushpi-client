import React from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { usePicoUnitContext } from '~ctx/PicoUnit';

type MetaButtonsProps = {
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
};

export const MetaButtons: React.FC<MetaButtonsProps> = ({ setDeleteOpen, setEditOpen }) => {
  const navigate = useNavigate();
  const { isLoading, refetch } = usePicoUnitContext();

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
  );
};

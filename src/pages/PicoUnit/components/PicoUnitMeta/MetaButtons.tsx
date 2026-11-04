import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import type { IconButtonProps } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ItemActions } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';

type MetaButtonsProps = {
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  onReconnect: () => void;
  onRebootPico: () => void;
};

type MetaActionButtonProps = {
  /** Plain action name — used as both the Tooltip title and the aria-label. */
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: IconButtonProps['color'];
  disabled?: boolean;
};

/**
 * Icon-only action button for the unit-detail header row: icon centered, name
 * revealed by Tooltip (long-press on touch) and announced by aria-label. The
 * Tooltip wraps a span so the title still works while the button is disabled.
 */
const MetaActionButton = ({ label, icon, onClick, color, disabled }: MetaActionButtonProps) => (
  <Tooltip title={label}>
    <span>
      <IconButton aria-label={label} color={color} onClick={onClick} disabled={disabled}>
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);

export const MetaButtons: React.FC<MetaButtonsProps> = ({
  setDeleteOpen,
  setEditOpen,
  onReconnect,
  onRebootPico,
}) => {
  const navigate = useNavigate();
  const { isLoading, refetch, pico } = usePicoUnitContext();

  return (
    <Stack
      direction="row"
      useFlexGap
      flexWrap="wrap"
      gap={1}
      alignItems="center"
      justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
    >
      {/* Unit-specific actions — one atomic block: it moves whole to the next
          line when it and the Edit/Delete pair do not fit, and wraps internally
          rather than clipping if it alone ever exceeds the width. */}
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        gap={1}
        alignItems="center"
        sx={{ order: { xs: 2, sm: 1 } }}
      >
        <MetaActionButton
          label="Ping"
          icon={<RefreshIcon />}
          color="success"
          onClick={() => refetch()}
          disabled={isLoading}
        />
        <MetaActionButton
          label="Readings"
          icon={<ShowChartIcon />}
          color="info"
          onClick={() => navigate('/readings')}
        />
        {pico && pico.status === 'offline' && (
          <MetaActionButton
            label="Reconnect"
            icon={<WifiTetheringIcon />}
            color="warning"
            onClick={onReconnect}
          />
        )}
        {pico?.monitored && (
          <MetaActionButton
            label="Reboot"
            icon={<RestartAltIcon />}
            color="error"
            onClick={onRebootPico}
          />
        )}
      </Stack>

      <Box sx={{ order: { xs: 1, sm: 2 }, flexShrink: 0 }}>
        <ItemActions onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
      </Box>
    </Stack>
  );
};

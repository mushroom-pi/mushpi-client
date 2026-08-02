import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

type UnitStatus = 'unmonitored' | 'healthy' | 'degraded' | 'offline';

const STATUS_CONFIG: Record<
  UnitStatus,
  { icon: ReactElement; tooltip: string }
> = {
  healthy: {
    icon: <CheckCircleIcon color="success" fontSize="small" />,
    tooltip: 'Unit is healthy and responding',
  },
  degraded: {
    icon: <WarningIcon color="warning" fontSize="small" />,
    tooltip: 'Sensor readings outside valid range',
  },
  offline: {
    icon: <ErrorIcon color="error" fontSize="small" />,
    tooltip: 'Unit is unreachable',
  },
  unmonitored: {
    icon: <PauseCircleIcon color="disabled" fontSize="small" />,
    tooltip: 'Monitoring is paused for this unit',
  },
};

export function UnitHealthIcon({ status }: { status: UnitStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unmonitored;

  return (
    <Tooltip title={config.tooltip}>
      {config.icon}
    </Tooltip>
  );
}

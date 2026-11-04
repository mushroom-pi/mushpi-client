import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

import type { PicoUnitStatusEnum } from '~api/generated';

/**
 * Server-owned unit health value set, *derived* from the generated contract
 * (`PicoUnit.status`) rather than hand-copied, so the literals are declared in
 * exactly one place (`src/api/generated`) and can never silently drift from the
 * server. Exported under the long-standing local name so call sites don't churn.
 * The icon/tooltip mapping below stays client-local presentation.
 * Guarded at compile time in `src/utils/pico.test.ts`.
 */
export type UnitStatus = PicoUnitStatusEnum;

const STATUS_CONFIG: Record<UnitStatus, { icon: ReactElement; tooltip: string }> = {
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

  return <Tooltip title={config.tooltip}>{config.icon}</Tooltip>;
}

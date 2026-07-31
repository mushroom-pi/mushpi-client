import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Tooltip } from '@mui/material';

import type { PicoUnit } from '~api/generated';
import { isUnitHealthy, shouldShowRebootHint } from '~utils/pico';

type HealthInput = Pick<PicoUnit, 'enabled' | 'failed_calls' | 'failed_readings'>;

export function UnitHealthIcon({
  pico,
  rebootHint = false,
}: {
  pico: HealthInput;
  rebootHint?: boolean;
}) {
  const healthy = isUnitHealthy(pico);
  let tooltip =
    (pico.failed_calls ?? 0) >= 3
      ? 'Unit unreachable — server cannot reach this Pico'
      : (pico.failed_readings ?? 0) >= 5
        ? 'Sensor fault — DHT11 readings outside valid range'
        : 'Unit is healthy and responding';

  if (rebootHint && shouldShowRebootHint(pico)) {
    tooltip += ' A reboot may recover the sensor if this persists.';
  }

  return (
    <Tooltip title={tooltip}>
      {healthy ? (
        <CheckCircleIcon color="success" fontSize="small" />
      ) : (
        <WarningIcon color="warning" fontSize="small" />
      )}
    </Tooltip>
  );
}

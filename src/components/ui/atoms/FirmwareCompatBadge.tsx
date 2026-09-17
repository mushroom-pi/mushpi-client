import { Chip, Tooltip } from '@mui/material';
import type React from 'react';

import type { CompatibilityStatus } from '~utils/pico';

interface FirmwareCompatBadgeProps {
  /** Server-owned verdict — this atom renders nothing unless it is `'incompatible'`. */
  status: CompatibilityStatus;
  /**
   * Reported Pico↔Server API-contract generation, used only to make the tooltip concrete.
   * Optional: `DashboardUnitItemDto` exposes `api_compatibility` but not `api_version`.
   */
  apiVersion?: number | null;
}

/**
 * Warning-only firmware/API-compatibility badge.
 *
 * Renders **nothing** for `'compatible'` and for `'unknown'` — an unjudged or legacy unit is
 * not an error (this mirrors the repo convention that missing version data is expected, not a
 * warning). Only an `'incompatible'` verdict surfaces a `warning` chip.
 *
 * The verdict is owned by the server (`PicoUnit.api_compatibility`); this component never
 * re-derives it and its copy deliberately does not assert a direction — an out-of-range value
 * can equally mean the *server* is the stale side, so we never say "firmware update required".
 */
export const FirmwareCompatBadge: React.FC<FirmwareCompatBadgeProps> = ({ status, apiVersion }) => {
  if (status !== 'incompatible') return null;

  const tooltip =
    apiVersion != null
      ? `This unit speaks API version ${apiVersion}, which is outside the range this server supports.`
      : "This unit's API version is outside the range this server supports.";

  return (
    <Tooltip title={tooltip}>
      {/* span keeps the Tooltip functional even though the Chip itself is inert */}
      <span>
        <Chip label="Incompatible firmware" size="small" color="warning" />
      </span>
    </Tooltip>
  );
};

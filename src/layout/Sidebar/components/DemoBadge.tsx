import { Chip, type SxProps, type Theme } from '@mui/material';

import { useDemoMode } from '~hook/useDemoMode';

/**
 * Compact, non-dismissible `DEMO` marker shown on every screen of a hub that
 * reports the demo environment. Renders nothing (zero DOM) on a non-demo hub.
 * No `onDelete`, no tooltip — the label is the only copy.
 */
export function DemoBadge({ sx }: { sx?: SxProps<Theme> }) {
  const { isDemo } = useDemoMode();
  if (!isDemo) return null;
  return <Chip size="small" color="warning" label="DEMO" sx={sx} />;
}

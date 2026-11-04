import { Box, Link, Typography } from '@mui/material';

import { useDemoMode } from '~hook/useDemoMode';
import { RELEASE_LABEL } from '~utils/buildInfo';
import { DEMO_DOCS_URL } from '~utils/externalLinks';

import { DemoBadge } from './DemoBadge';

/**
 * Sidebar footer group for demo hubs: the `DEMO` chip first and the release
 * tag beside it on one row, with the short static explanation beneath both.
 * Client-owned demo copy — distinct from the server-owned refusal/slow-down
 * wording in error toasts. Renders nothing (zero DOM) on a non-demo hub;
 * lives only in the drawer footer chrome.
 */
export function DemoNotice() {
  const { isDemo } = useDemoMode();
  if (!isDemo) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DemoBadge />
        <Typography variant="caption">{RELEASE_LABEL}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        Sample data, simulated pico units,{' '}
        <Link
          href={DEMO_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          underline="hover"
        >
          read-only functionalities
        </Link>
      </Typography>
    </Box>
  );
}

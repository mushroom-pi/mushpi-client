import { Box, Stack, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

export const AlignedButton = ({
  tooltip,
  children,
}: {
  tooltip?: string;
  children: ReactElement;
}) => (
  <Stack>
    {tooltip ? <Tooltip title={tooltip}>{children}</Tooltip> : children}
    <Box flex={1} sx={{ minHeight: { xs: 0, lg: '1.2em' } }} />
  </Stack>
);

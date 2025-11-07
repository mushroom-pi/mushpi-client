import { Box, Stack, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';

export const AlignedButton = ({
  tooltip,
  children,
}: {
  tooltip: string;
  children: ReactElement;
}) => (
  <Stack>
    <Tooltip title={tooltip}>{children}</Tooltip>
    <Box flex={1} sx={{ minHeight: '1.2em' }} />
  </Stack>
);

import { Box, Tooltip } from '@mui/material';
import type React from 'react';

interface IconChartRowProps {
  tooltip: string;
  icon: React.ReactElement;
  iconColWidth: number;
  /** Optional translateY offset on the icon — used when the last chart in a stack has an X axis */
  iconOffset?: number;
  children: React.ReactNode;
}

export const IconChartRow: React.FC<IconChartRowProps> = ({
  tooltip,
  icon,
  iconColWidth,
  iconOffset,
  children,
}) => (
  <Box display="flex" alignItems="center" width="100%" gap={1}>
    <Box
      width={iconColWidth}
      display="flex"
      justifyContent="center"
      flexShrink={0}
      sx={iconOffset != null ? { transform: `translateY(${iconOffset}px)` } : undefined}
    >
      <Tooltip title={tooltip}>{icon}</Tooltip>
    </Box>
    <Box flex={1} minWidth={0}>
      {children}
    </Box>
  </Box>
);

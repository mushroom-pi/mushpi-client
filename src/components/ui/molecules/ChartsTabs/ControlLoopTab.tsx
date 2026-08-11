import { Box, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

import { OnOffChart } from './Charts/OnOffChart';

const ICON_COL_WIDTH_DESKTOP = 40;
const ICON_COL_WIDTH_MOBILE = 30;
const CONTROL_LOOP_HEIGHT_DESKTOP = 200;
const CONTROL_LOOP_HEIGHT_MOBILE = 160;

export const ControlLoopTab: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const iconColWidth = isMobile ? ICON_COL_WIDTH_MOBILE : ICON_COL_WIDTH_DESKTOP;
  const chartHeight = isMobile ? CONTROL_LOOP_HEIGHT_MOBILE : CONTROL_LOOP_HEIGHT_DESKTOP;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" alignItems="center" width="100%" gap={1}>
        <Box width={iconColWidth} flexShrink={0} />
        <Box flex={1} minWidth={0}>
          <OnOffChart dataKey="controlLoopEnabled" showXAxis height={chartHeight} />
        </Box>
      </Box>
    </Box>
  );
};

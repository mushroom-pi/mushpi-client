import { Box } from '@mui/material';
import React from 'react';

import { OnOffChart } from './Charts/OnOffChart';

export const ControlLoopTab: React.FC = () => (
  <Box display="flex" flexDirection="column" gap={1}>
    <Box display="flex" alignItems="center">
      <Box px={2} ml={1} />
      <OnOffChart dataKey="control_loop" showXAxis showBrush />
    </Box>
  </Box>
);

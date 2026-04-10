import { Box } from '@mui/material';
import React from 'react';

import { InfoCard } from '~components';

import { OnOffChart } from './Charts/OnOffChart';

export const ControlLoopCard: React.FC = () => (
  <InfoCard title="Control Loop" subtitle="Whether the control loop is enabled or disabled">
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" alignItems="center">
        <Box px={2} ml={1} />
        <OnOffChart dataKey="control_loop" showXAxis showBrush />
      </Box>
    </Box>
  </InfoCard>
);

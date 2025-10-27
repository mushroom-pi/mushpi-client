import { Box } from '@mui/material';
import React from 'react';

import { InfoCard } from 'src/components/InfoCard';
import { Loading } from 'src/components/Loading';

import { OnOffChart } from './OnOffChart';

interface ControlLoopCardProps {
  data: any[];
  commonTicks: any[];
}

export const ControlLoopCard: React.FC<ControlLoopCardProps> = ({ data, commonTicks }) => {
  return (
    <InfoCard title="Control Loop" subtitle="Whether the control loop is enabled or disabled">
      {!data || data.length === 0 ? (
        <Loading item="data" />
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center">
            <Box px={2} ml={1} />

            <OnOffChart
              data={data}
              dataKey="humidifierOn"
              showXAxis
              showBrush
              commonTicks={commonTicks}
            />
          </Box>
        </Box>
      )}
    </InfoCard>
  );
};

export default ControlLoopCard;

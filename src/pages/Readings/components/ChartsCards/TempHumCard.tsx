import { Box, Tooltip } from '@mui/material';
import type React from 'react';
import { FaTemperatureHigh as TemperatureIcon } from 'react-icons/fa';
import { RiWaterPercentFill as HumidityIcon } from 'react-icons/ri';

import { InfoCard } from '~components';

import { TempHumChart } from './Charts/TempHumChart';

export const TempHumCard: React.FC = () => (
  <InfoCard title="Temperature and Humidity" subtitle="Measurements and targets in time">
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" alignItems="center">
        <Tooltip title="Temperature">
          <TemperatureIcon size={35} />
        </Tooltip>
        <TempHumChart />
        <Tooltip title="Humidity">
          <HumidityIcon size={35} />
        </Tooltip>
      </Box>
    </Box>
  </InfoCard>
);

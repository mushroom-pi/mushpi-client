import { Box, Tooltip } from '@mui/material';
import type React from 'react';
import { FaTemperatureHigh as TemperatureIcon } from 'react-icons/fa';
import { RiWaterPercentFill as HumidityIcon } from 'react-icons/ri';

import { InfoCard } from '~comp/InfoCard';
import { Loading } from '~comp/Loading';

import { TempHumChart } from './TempHumChart';

export interface TempHumCardProps {
  data: any[];
  commonTicks: any[];
}

export const TempHumCard: React.FC<TempHumCardProps> = ({ data, commonTicks }) => (
  <InfoCard title="Temperature and Humidity" subtitle="Measurements and targets in time">
    {!data || data.length === 0 ? (
      <Loading item="data" />
    ) : (
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center">
          <Tooltip title="Temperature">
            <TemperatureIcon size={35} />
          </Tooltip>
          <TempHumChart data={data} commonTicks={commonTicks} />
          <Tooltip title="Humidity">
            <HumidityIcon size={35} />
          </Tooltip>
        </Box>
      </Box>
    )}
  </InfoCard>
);

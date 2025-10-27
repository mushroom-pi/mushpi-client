import { Box, Tooltip } from '@mui/material';
import React from 'react';
import { FaHotjar as HeaterIcon, FaCloudRain as HumidifierIcon } from 'react-icons/fa';
import { PiFanFill as FanIcon } from 'react-icons/pi';

import { InfoCard } from '~comp/InfoCard';

import { OnOffChart } from './OnOffChart';

export const DevicesCard: React.FC = () => (
  <InfoCard title="Devices" subtitle="ON/OFF status of each connected component">
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" alignItems="center" ml={1}>
        <Tooltip title="Humidifier">
          <HumidifierIcon size={35} />
        </Tooltip>
        <OnOffChart dataKey="humidifier" />
      </Box>
      <Box display="flex" alignItems="center" ml={1}>
        <Tooltip title="Fan">
          <FanIcon size={35} />
        </Tooltip>
        <OnOffChart dataKey="fan" />
      </Box>
      <Box display="flex" alignItems="center" ml={1}>
        <Tooltip title="Heater">
          <HeaterIcon size={35} />
        </Tooltip>
        <OnOffChart dataKey="heater" />
      </Box>
    </Box>
  </InfoCard>
);

export default DevicesCard;

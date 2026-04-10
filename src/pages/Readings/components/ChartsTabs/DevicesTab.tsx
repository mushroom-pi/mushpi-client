import { Box, Tooltip } from '@mui/material';
import React from 'react';
import { FaHotjar as HeaterIcon, FaCloudRain as HumidifierIcon } from 'react-icons/fa';
import { PiFanFill as FanIcon } from 'react-icons/pi';

import { OnOffChart } from './Charts/OnOffChart';

const DEVICE_PANEL_HEIGHT = 200;
const HEATER_ICON_OFFSET_Y = -18;

export const DevicesTab: React.FC = () => (
  <Box display="flex" flexDirection="column" gap={1}>
    <Box display="flex" alignItems="center" ml={1}>
      <Tooltip title="Humidifier">
        <HumidifierIcon size={35} />
      </Tooltip>
      <OnOffChart dataKey="humidifier" height={DEVICE_PANEL_HEIGHT} />
    </Box>
    <Box display="flex" alignItems="center" ml={1}>
      <Tooltip title="Fan">
        <FanIcon size={35} />
      </Tooltip>
      <OnOffChart dataKey="fan" height={DEVICE_PANEL_HEIGHT} />
    </Box>
    <Box display="flex" alignItems="center" ml={1}>
      <Box sx={{ transform: `translateY(${HEATER_ICON_OFFSET_Y}px)` }}>
        <Tooltip title="Heater">
          <HeaterIcon size={35} />
        </Tooltip>
      </Box>
      <OnOffChart dataKey="heater" showXAxis showBrush height={DEVICE_PANEL_HEIGHT} />
    </Box>
  </Box>
);

export default DevicesTab;

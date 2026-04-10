import { Box, Tooltip } from '@mui/material';
import type React from 'react';
import { FaTemperatureHigh as TemperatureIcon } from 'react-icons/fa';
import { RiWaterPercentFill as HumidityIcon } from 'react-icons/ri';

import { InfoCard } from '~components';

import { ReadingsTargetChart } from './Charts/ReadingsTargetChart';

const TEMP_HUM_PANEL_HEIGHT = 270;
const ICON_OFFSET_WITH_AXIS = -18;

export const TempHumCard: React.FC = () => (
  <InfoCard
    title="Temperature and Humidity"
    subtitle="Split view: humidity and temperature with individual targets"
  >
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" alignItems="center" width="100%">
        <Tooltip title="Humidity">
          <HumidityIcon size={35} />
        </Tooltip>
        <ReadingsTargetChart
          actualKey="humidity"
          targetKey="humidity_target"
          unit="%"
          label="Humidity"
          height={TEMP_HUM_PANEL_HEIGHT}
        />
      </Box>
      <Box display="flex" alignItems="center" width="100%">
        <Box sx={{ transform: `translateY(${ICON_OFFSET_WITH_AXIS}px)` }}>
          <Tooltip title="Temperature">
            <TemperatureIcon size={35} />
          </Tooltip>
        </Box>
        <ReadingsTargetChart
          actualKey="temperature"
          targetKey="temperature_target"
          unit="°C"
          label="Temperature"
          showXAxis
          showBrush
          height={TEMP_HUM_PANEL_HEIGHT}
        />
      </Box>
    </Box>
  </InfoCard>
);

import { Box, useMediaQuery, useTheme } from '@mui/material';
import type React from 'react';
import { FaTemperatureHigh as TemperatureIcon } from 'react-icons/fa';
import { RiWaterPercentFill as HumidityIcon } from 'react-icons/ri';

import { IconChartRow } from '~components';

import { ReadingsTargetChart } from './Charts/ReadingsTargetChart';

const TEMP_HUM_PANEL_HEIGHT_DESKTOP = 270;
const TEMP_HUM_PANEL_HEIGHT_MOBILE = 220;
const ICON_OFFSET_WITH_AXIS_DESKTOP = -18;
const ICON_OFFSET_WITH_AXIS_MOBILE = -12;
const ICON_COL_WIDTH_DESKTOP = 40;
const ICON_COL_WIDTH_MOBILE = 30;
const ICON_SIZE_DESKTOP = 35;
const ICON_SIZE_MOBILE = 26;

export const TempHumTab: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const panelHeight = isMobile ? TEMP_HUM_PANEL_HEIGHT_MOBILE : TEMP_HUM_PANEL_HEIGHT_DESKTOP;
  const iconOffset = isMobile ? ICON_OFFSET_WITH_AXIS_MOBILE : ICON_OFFSET_WITH_AXIS_DESKTOP;
  const iconColWidth = isMobile ? ICON_COL_WIDTH_MOBILE : ICON_COL_WIDTH_DESKTOP;
  const iconSize = isMobile ? ICON_SIZE_MOBILE : ICON_SIZE_DESKTOP;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <IconChartRow
        tooltip="Humidity"
        icon={<HumidityIcon size={iconSize} />}
        iconColWidth={iconColWidth}
      >
        <ReadingsTargetChart
          actualKey="humidity"
          targetKey="humidity_target"
          unit="%"
          label="Humidity"
          height={panelHeight}
        />
      </IconChartRow>

      <IconChartRow
        tooltip="Temperature"
        icon={<TemperatureIcon size={iconSize} />}
        iconColWidth={iconColWidth}
        iconOffset={iconOffset}
      >
        <ReadingsTargetChart
          actualKey="temperature"
          targetKey="temperature_target"
          unit="°C"
          label="Temperature"
          showXAxis
          height={panelHeight}
        />
      </IconChartRow>
    </Box>
  );
};

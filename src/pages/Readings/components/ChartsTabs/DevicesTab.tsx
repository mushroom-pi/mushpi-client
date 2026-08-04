import { Box, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { FaHotjar as HeaterIcon, FaCloudRain as HumidifierIcon } from 'react-icons/fa';
import { PiFanFill as FanIcon } from 'react-icons/pi';

import { IconChartRow } from '~components';

import { OnOffChart } from './Charts/OnOffChart';

const DEVICE_PANEL_HEIGHT_DESKTOP = 200;
const DEVICE_PANEL_HEIGHT_MOBILE = 160;
const HEATER_ICON_OFFSET_Y_DESKTOP = -18;
const HEATER_ICON_OFFSET_Y_MOBILE = -12;
const ICON_COL_WIDTH_DESKTOP = 40;
const ICON_COL_WIDTH_MOBILE = 30;
const ICON_SIZE_DESKTOP = 35;
const ICON_SIZE_MOBILE = 26;

export const DevicesTab: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const panelHeight = isMobile ? DEVICE_PANEL_HEIGHT_MOBILE : DEVICE_PANEL_HEIGHT_DESKTOP;
  const iconOffset = isMobile ? HEATER_ICON_OFFSET_Y_MOBILE : HEATER_ICON_OFFSET_Y_DESKTOP;
  const iconColWidth = isMobile ? ICON_COL_WIDTH_MOBILE : ICON_COL_WIDTH_DESKTOP;
  const iconSize = isMobile ? ICON_SIZE_MOBILE : ICON_SIZE_DESKTOP;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <IconChartRow
        tooltip="Humidifier"
        icon={<HumidifierIcon size={iconSize} />}
        iconColWidth={iconColWidth}
      >
        <OnOffChart dataKey="humidifier" height={panelHeight} />
      </IconChartRow>

      <IconChartRow tooltip="Fan" icon={<FanIcon size={iconSize} />} iconColWidth={iconColWidth}>
        <OnOffChart dataKey="fan" height={panelHeight} />
      </IconChartRow>

      <IconChartRow
        tooltip="Heater"
        icon={<HeaterIcon size={iconSize} />}
        iconColWidth={iconColWidth}
        iconOffset={iconOffset}
      >
        <OnOffChart dataKey="heater" showXAxis height={panelHeight} />
      </IconChartRow>
    </Box>
  );
};

export default DevicesTab;

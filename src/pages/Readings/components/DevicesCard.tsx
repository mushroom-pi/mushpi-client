import { Box, Tooltip } from '@mui/material';
import React, { useMemo } from 'react';
import { FaHotjar as HeaterIcon, FaCloudRain as HumidifierIcon } from 'react-icons/fa';
import { PiFanFill as FanIcon } from 'react-icons/pi';

import { InfoCard } from 'src/components/InfoCard';
import { Loading } from 'src/components/Loading';

import { OnOffChart } from './OnOffChart';

interface DevicesCardProps {
  data: any[];
  commonTicks: any[];
}

export const DevicesCard: React.FC<DevicesCardProps> = ({ data, commonTicks }) => {
  return (
    <InfoCard title="Devices" subtitle="ON/OFF status of each connected component">
      {!data || data.length === 0 ? (
        <Loading item="data" />
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" ml={1}>
            <Tooltip title="Humidifier">
              <HumidifierIcon size={35} />
            </Tooltip>

            <OnOffChart data={data} dataKey="humidifierOn" commonTicks={commonTicks} />
          </Box>
          <Box display="flex" alignItems="center" ml={1}>
            <Tooltip title="Fan">
              <FanIcon size={35} />
            </Tooltip>

            <OnOffChart data={data} dataKey="fanOn" commonTicks={commonTicks} />
          </Box>
          <Box display="flex" alignItems="center" ml={1}>
            <Tooltip title="Heater">
              <HeaterIcon size={35} />
            </Tooltip>

            <OnOffChart data={data} dataKey="heaterOn" commonTicks={commonTicks} />
          </Box>
        </Box>
      )}
    </InfoCard>
  );
};

export default DevicesCard;

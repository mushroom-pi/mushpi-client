import { Box } from '@mui/material';
import type React from 'react';

import { Loading } from '~comp/Loading';
import { OnOffInfo } from '~comp/OnOffInfo';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

export const DevicesInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const { humidifier_on: humidifierOn, fan_on: fanOn, heater_on: heaterOn } = pico.latest_reading;

  return (
    <Box>
      <OnOffInfo label="Humidifier" value={humidifierOn} />
      <OnOffInfo label="Fan" value={fanOn} />
      <OnOffInfo label="Heater" value={heaterOn} />
    </Box>
  );
};

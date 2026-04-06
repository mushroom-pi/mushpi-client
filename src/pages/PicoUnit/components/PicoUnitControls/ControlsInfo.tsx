import { Chip } from '@mui/material';
import type React from 'react';

import { InfoField, Loading, OnOffInfo } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

export const ControlsInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const {
    control_loop_enabled: controlLoop,
    temperature_set: tempTarget,
    humidity_set: humTarget,
  } = pico.latest_reading;

  return (
    <>
      <OnOffInfo label="Control loop" value={controlLoop} />
      <InfoField label="Target temperature" display="beside">
        <Chip
          label={tempTarget ? `${tempTarget} °C` : '—'}
          color={controlLoop ? 'info' : 'default'}
          size="medium"
        />
      </InfoField>
      <InfoField label="Target humidity" display="beside">
        <Chip
          label={humTarget ? `${humTarget} %` : '—'}
          color={controlLoop ? 'info' : 'default'}
          size="medium"
        />
      </InfoField>
    </>
  );
};

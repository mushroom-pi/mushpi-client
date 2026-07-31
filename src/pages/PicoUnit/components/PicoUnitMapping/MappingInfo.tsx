import { Chip } from '@mui/material';
import type React from 'react';

import { InfoField, Loading } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { DEFAULT_PINS, formatGp } from './picoPinout';

export const MappingInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico) return <Loading />;

  const devices = (pico as any).devices;
  const pins = devices?.pins ?? DEFAULT_PINS;

  return (
    <>
      <InfoField label="DHT11" display="beside">
        <Chip label={formatGp(pins.dht)} color="info" size="small" />
      </InfoField>
      <InfoField label="Humidifier" display="beside">
        <Chip label={formatGp(pins.humidifier)} color="info" size="small" />
      </InfoField>
      <InfoField label="Fan" display="beside">
        <Chip label={formatGp(pins.fan)} color="info" size="small" />
      </InfoField>
      <InfoField label="Heater" display="beside">
        <Chip label={formatGp(pins.heater)} color="info" size="small" />
      </InfoField>
    </>
  );
};

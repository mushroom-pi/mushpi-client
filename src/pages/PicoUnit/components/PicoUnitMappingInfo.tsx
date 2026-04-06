import ConnectionsIcon from '@mui/icons-material/SettingsInputComponent';
import { Chip } from '@mui/material';
import type React from 'react';

import { EditableInfoCard, InfoField, Loading } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

export const PicoUnitMappingInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  return (
    <EditableInfoCard
      title="PIN Mapping"
      // subtitle="Is the unit actively maintaining the pre-set targets?"
      icon={<ConnectionsIcon />}
    >
      <InfoField label="DHT11" display="beside">
        <Chip label="GPIO4" color="info" size="small" />
      </InfoField>
      <InfoField label="Humidifier" display="beside">
        <Chip label="GPIO6" color="info" size="small" />
      </InfoField>
      <InfoField label="Fan" display="beside">
        <Chip label="GPIO7" color="info" size="small" />
      </InfoField>
      <InfoField label="Heater" display="beside">
        <Chip label="GPIO8" color="info" size="small" />
      </InfoField>
    </EditableInfoCard>
  );
};

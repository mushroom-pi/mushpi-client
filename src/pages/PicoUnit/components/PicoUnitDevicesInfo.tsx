import FanIcon from '@mui/icons-material/WindPower';
import { Chip, Stack, Switch } from '@mui/material';
import type React from 'react';

import { EditableInfoCard } from '~comp/EditableInfoCard';
import { InfoField } from '~comp/InfoField';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

const OnOff: React.FC<{ label: string; enabled: boolean }> = ({ label, enabled }) => (
  <InfoField label={label} display="beside">
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Chip label="Off" color={enabled ? 'default' : 'info'} size="small" />
      <Switch checked={enabled} name={label.toLowerCase()} disabled={true} size="medium" />
      <Chip label="On" color={enabled ? 'info' : 'default'} size="small" />
    </Stack>
  </InfoField>
);

export const PicoUnitDevicesInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const { humidifier_on: humidifierOn, fan_on: fanOn, heater_on: heaterOn } = pico.latest_reading;

  return (
    <EditableInfoCard
      title="Devices"
      // subtitle="Is the unit actively maintaining the pre-set targets?"
      icon={<FanIcon />}
    >
      <OnOff label="Humidifier" enabled={humidifierOn} />
      <OnOff label="Fan" enabled={fanOn} />
      <OnOff label="Heater" enabled={heaterOn} />
    </EditableInfoCard>
  );
};

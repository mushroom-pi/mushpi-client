import TuneIcon from '@mui/icons-material/Tune';
import { Chip } from '@mui/material';
import type React from 'react';

import { EditableInfoCard } from '~comp/EditableInfoCard';
import { InfoField } from '~comp/InfoField';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

export const PicoUnitControlsInfo: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const {
    control_loop_enabled: controlLoop,
    temperature_set: tempTarget,
    humidity_set: humTarget,
  } = pico.latest_reading;

  return (
    <EditableInfoCard
      title="Controls"
      // subtitle="Is the unit actively maintaining the pre-set targets?"
      icon={<TuneIcon />}
    >
      <InfoField label="Control loop" display="beside">
        <Chip
          label={controlLoop ? 'Enabled' : 'Disabled'}
          color={controlLoop ? 'info' : 'default'}
          size="medium"
        />
      </InfoField>
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
    </EditableInfoCard>
  );
};

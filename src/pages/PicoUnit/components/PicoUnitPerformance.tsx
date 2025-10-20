import SpeedIcon from '@mui/icons-material/Speed';
import { Chip } from '@mui/material';
import React from 'react';

import { chipColorForFailedCalls } from 'src/utils/methods';

import { InfoCard } from '~comp/InfoCard';
import { InfoField } from '~comp/InfoField';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnitContext';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

function chipColorForResponse(ms?: number | null) {
  if (typeof ms !== 'number') return 'default';
  if (ms > 2000) return 'error';
  if (ms > 500) return 'warning';
  return 'success';
}

export const PicoUnitPerformance: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const { latest_reading: lr, failed_calls } = pico;
  const isHealthy = failed_calls < 3;

  return (
    <InfoCard title="Perfomance" subtitle="Latest metrics" icon={<SpeedIcon />}>
      <InfoField label="Failed calls" display="beside">
        <Chip
          label={typeof failed_calls === 'number' ? `${failed_calls}` : '0'}
          color={chipColorForFailedCalls(failed_calls)}
          size="medium"
        />
      </InfoField>
      <InfoField label="Board temperature" display="beside">
        <Chip
          label={typeof lr.board_temp === 'number' && isHealthy ? `${lr.board_temp} °C` : '—'}
          color={Math.abs(lr.board_temp ?? 0) > 85 ? 'error' : 'success'}
          size="medium"
        />
      </InfoField>
      <InfoField label="Response time" display="beside">
        <Chip
          label={
            typeof lr.time_to_response_ms === 'number' && isHealthy
              ? `${lr.time_to_response_ms} ms`
              : '—'
          }
          color={chipColorForResponse(lr.time_to_response_ms)}
          size="medium"
        />
      </InfoField>
    </InfoCard>
  );
};

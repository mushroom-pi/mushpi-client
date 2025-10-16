import SpeedIcon from '@mui/icons-material/Speed';
import { Chip } from '@mui/material';
import React from 'react';

import { InfoCard } from 'src/components/InfoCard';
import { InfoField } from 'src/components/InfoField';
import { Loading } from 'src/components/Loading';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';
import type { OptionalPicoUnitProps } from 'src/interfaces/optionalPicoUnit';
import { chipColorForFailedCalls } from 'src/utils/methods';

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
      <InfoField label="Failed calls">
        <Chip
          label={typeof failed_calls === 'number' ? `${failed_calls}` : '0'}
          color={chipColorForFailedCalls(failed_calls)}
          size="medium"
        />
      </InfoField>
      <InfoField label="Board temperature">
        <Chip
          label={typeof lr.board_temp === 'number' && isHealthy ? `${lr.board_temp}°C` : '—'}
          color={Math.abs(lr.board_temp ?? 0) > 85 ? 'error' : 'success'}
          size="medium"
        />
      </InfoField>
      <InfoField label="Time to response">
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

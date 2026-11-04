import SpeedIcon from '@mui/icons-material/Speed';
import { Chip } from '@mui/material';
import React from 'react';

import { InfoCard, InfoField, Loading } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';
import { chipColorForFailedCalls, chipColorForFailedReadings } from '~utils/pico';

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

  const { latest_reading: lr, failed_calls, failed_readings } = pico;
  // Trust the server-computed health verdict instead of re-deriving it from
  // `failed_calls` — the server flips a monitored unit to 'offline' once failed
  // polls reach its threshold (see OFFLINE_FAILED_CALLS_THRESHOLD in ~utils/pico).
  // When unreachable, the latest reading is stale, so mask the perf metrics.
  const isReachable = pico.status !== 'offline';

  return (
    <InfoCard title="Perfomance" subtitle="Latest metrics" icon={<SpeedIcon />}>
      <InfoField
        label="Failed calls"
        display="beside"
        tooltip="Consecutive failed attempts to reach the pico unit from the server. Resets to 0 on a successful reach."
      >
        <Chip
          label={typeof failed_calls === 'number' ? `${failed_calls}` : '0'}
          color={chipColorForFailedCalls(failed_calls)}
          size="medium"
        />
      </InfoField>
      <InfoField
        label="Failed readings"
        display="beside"
        tooltip="Consecutive DHT11 readings outside valid range (0–50 °C, 10–90% humidity). Resets to 0 on a valid reading."
      >
        <Chip
          label={typeof failed_readings === 'number' ? `${failed_readings}` : '0'}
          color={chipColorForFailedReadings(failed_readings)}
          size="medium"
        />
      </InfoField>
      <InfoField
        label="Board temperature"
        display="beside"
        tooltip="This shouldn't be higher than 85 °C"
      >
        <Chip
          label={typeof lr.board_temp === 'number' && isReachable ? `${lr.board_temp} °C` : '—'}
          color={!isReachable || Math.abs(lr.board_temp ?? 0) > 85 ? 'error' : 'success'}
          size="medium"
        />
      </InfoField>
      <InfoField label="Response time" display="beside" tooltip="This shouldn't be over 1 second">
        <Chip
          label={
            isReachable && typeof lr.time_to_response_ms === 'number'
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

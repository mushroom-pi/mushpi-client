import DataUsageIcon from '@mui/icons-material/DataUsage';
import { LinearProgress } from '@mui/material';
import React from 'react';

import { InfoCard } from 'src/components/InfoCard';
import { InfoField } from 'src/components/InfoField';
import { Loading } from 'src/components/Loading';
import { ReadableTime } from 'src/components/ReadableTime';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';
import type { OptionalPicoUnitProps } from 'src/interfaces/optionalPicoUnit';
import { bytesToMB } from 'src/utils/methods';

function pctNumber(value?: number | null, total?: number | null) {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) return null;
  return Math.round((value / total) * 100);
}

function severityColorForPct(pct: number | null) {
  if (pct === null) return 'inherit';
  if (pct >= 90) return 'error.main';
  if (pct >= 75) return 'warning.main';
  return 'success.main';
}

export const PicoUnitResources: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico || !pico.latest_reading) return <Loading />;

  const {
    latest_reading: lr,
    board_total_fs_byte: totalFS,
    board_total_mem_byte: totalRAM,
    failed_calls,
  } = pico;
  const isHealthy = failed_calls < 3;
  const fsPct = isHealthy ? pctNumber(lr.board_used_fs ?? null, totalFS ?? null) : null;
  const memPct = isHealthy ? pctNumber(lr.board_used_mem ?? null, totalRAM ?? null) : null;

  return (
    <InfoCard title="Resources" subtitle="Capacity usage" icon={<DataUsageIcon />}>
      <InfoField label="Uptime">
        <ReadableTime seconds={isHealthy ? lr.board_uptime_s : null} variant="body1" />
      </InfoField>
      <InfoField
        label={`RAM used${totalRAM ? `(of ${bytesToMB(totalRAM)})` : ''} `}
        extra={memPct ? `${memPct}%` : undefined}
      >
        <LinearProgress
          variant="determinate"
          value={memPct ?? 0}
          sx={{
            height: 10,
            borderRadius: 2,
            mt: 1,
            backgroundColor: 'divider',
            '& .MuiLinearProgress-bar': {
              bgcolor: severityColorForPct(memPct),
            },
          }}
        />
      </InfoField>
      <InfoField
        label={`Filesystem used${totalFS ? `(of ${bytesToMB(totalFS)})` : ''}`}
        extra={fsPct ? `${fsPct}%` : undefined}
      >
        <LinearProgress
          variant="determinate"
          value={fsPct ?? 0}
          sx={{
            height: 10,
            borderRadius: 2,
            mt: 1,
            backgroundColor: 'divider',
            '& .MuiLinearProgress-bar': {
              bgcolor: severityColorForPct(fsPct),
            },
          }}
        />
      </InfoField>
    </InfoCard>
  );
};

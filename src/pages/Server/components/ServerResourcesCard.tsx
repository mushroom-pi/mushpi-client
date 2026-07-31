import DataUsageIcon from '@mui/icons-material/DataUsage';
import { LinearProgress } from '@mui/material';
import type { FC } from 'react';

import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { InfoCard, InfoField, ReadableTime } from '~components';

function toGB(mb: number): number {
  return Math.round((mb / 1024) * 10) / 10;
}

function severityColorForLoad(load?: number | null) {
  if (!load) return 'inherit';
  if (load >= 0.9) return 'error.main';
  if (load >= 0.75) return 'warning.main';
  return 'success.main';
}

function severityColorForUsage(usedPercent?: number | null) {
  if (usedPercent == null) return 'inherit';
  if (usedPercent >= 90) return 'error.main';
  if (usedPercent >= 75) return 'warning.main';
  return 'success.main';
}

interface ServerResourcesCardProps {
  serverHealth: ServerHealth;
}

export const ServerResourcesCard: FC<ServerResourcesCardProps> = ({ serverHealth }) => {
  const system = serverHealth.system;
  const memory = system?.memory;
  const disk = system?.disk;

  const memoryUsedPercent =
    memory && memory.totalMb > 0 ? 100 - (memory.freeMb / memory.totalMb) * 100 : null;

  const diskUsedPercent =
    disk && disk.totalMb != null && disk.totalMb > 0 && disk.freeMb != null
      ? ((disk.totalMb - disk.freeMb) / disk.totalMb) * 100
      : null;

  return (
    <InfoCard title="Resources" subtitle="Capacity usage" icon={<DataUsageIcon />}>
      <InfoField label="App uptime">
        <ReadableTime seconds={serverHealth.server?.upTime.seconds} variant="body1" />
      </InfoField>
      {system?.upTime && (
        <InfoField label="System uptime">
          <ReadableTime seconds={system.upTime.seconds} variant="body1" />
        </InfoField>
      )}
      {['1 minute', '5 minutes', '15 minutes'].map((t, i) => (
        <InfoField
          label={`Load average (${t})`}
          extra={String(serverHealth.server?.loadAverage[i])}
        >
          <LinearProgress
            variant="determinate"
            value={serverHealth.server?.loadAverage[i] ?? 0}
            sx={{
              height: 10,
              borderRadius: 2,
              mt: 1,
              backgroundColor: 'divider',
              '& .MuiLinearProgress-bar': {
                bgcolor: severityColorForLoad(serverHealth.server?.loadAverage[i]),
              },
            }}
          />
        </InfoField>
      ))}
      {memory && memoryUsedPercent != null && (
        <InfoField
          label="Memory used"
          extra={`${toGB(memory.totalMb - memory.freeMb)} / ${toGB(memory.totalMb)} GB`}
        >
          <LinearProgress
            variant="determinate"
            value={memoryUsedPercent}
            sx={{
              height: 10,
              borderRadius: 2,
              mt: 1,
              backgroundColor: 'divider',
              '& .MuiLinearProgress-bar': {
                bgcolor: severityColorForUsage(memoryUsedPercent),
              },
            }}
          />
        </InfoField>
      )}
      {disk && diskUsedPercent != null && disk.totalMb != null && disk.freeMb != null && (
        <InfoField
          label="Disk used"
          extra={`${toGB(disk.totalMb - disk.freeMb)} / ${toGB(disk.totalMb)} GB`}
        >
          <LinearProgress
            variant="determinate"
            value={diskUsedPercent}
            sx={{
              height: 10,
              borderRadius: 2,
              mt: 1,
              backgroundColor: 'divider',
              '& .MuiLinearProgress-bar': {
                bgcolor: severityColorForUsage(diskUsedPercent),
              },
            }}
          />
        </InfoField>
      )}
    </InfoCard>
  );
};

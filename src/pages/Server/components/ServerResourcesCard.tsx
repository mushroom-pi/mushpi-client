import DataUsageIcon from '@mui/icons-material/DataUsage';
import { LinearProgress } from '@mui/material';
import type { FC } from 'react';

import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { InfoCard, InfoField, ReadableTime } from '~components';

function severityColorForLoad(load?: number | null) {
  if (!load) return 'inherit';
  if (load >= 0.9) return 'error.main';
  if (load >= 0.75) return 'warning.main';
  return 'success.main';
}

interface ServerResourcesCardProps {
  serverHealth: ServerHealth;
}

export const ServerResourcesCard: FC<ServerResourcesCardProps> = ({ serverHealth }) => (
  <InfoCard title="Resources" subtitle="Capacity usage" icon={<DataUsageIcon />}>
    <InfoField label="Uptime">
      <ReadableTime seconds={serverHealth.server?.upTime.seconds} variant="body1" />
    </InfoField>
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
  </InfoCard>
);

import StorageIcon from '@mui/icons-material/Storage';
import { Typography } from '@mui/material';
import type { FC } from 'react';

import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { BigDisplay, InfoCard, InfoField } from '~components';
import { useDemoMode } from '~hook/useDemoMode';
import { CLIENT_BUILD_VERSION } from '~utils/buildInfo';

interface ServerOverviewCardProps {
  serverHealth: ServerHealth;
}

export const ServerOverviewCard: FC<ServerOverviewCardProps> = ({ serverHealth }) => {
  const { isDemo } = useDemoMode();
  const system = serverHealth.system;
  const os = system?.os;
  const cpu = system?.cpu;

  return (
    <InfoCard title="Overview" subtitle="General status" icon={<StorageIcon />}>
      <InfoField label="App version">
        <BigDisplay content={serverHealth.server?.appVersion} />
      </InfoField>
      <InfoField label="Client build version">
        <BigDisplay content={CLIENT_BUILD_VERSION} />
      </InfoField>
      <InfoField label="Node.js version">
        <BigDisplay content={serverHealth.server?.nodeVersion} />
      </InfoField>
      {os && !isDemo && (
        <InfoField label="OS">
          <Typography variant="body2">
            {os.platform} ({os.arch})
          </Typography>
        </InfoField>
      )}
      {os && !isDemo && (
        <InfoField label="Hostname">
          <Typography variant="body2">{os.hostname}</Typography>
        </InfoField>
      )}
      {cpu && !isDemo && (
        <InfoField label="CPU">
          <Typography variant="body2">
            {cpu.model} ({cpu.cores} {cpu.cores === 1 ? 'core' : 'cores'})
          </Typography>
        </InfoField>
      )}
    </InfoCard>
  );
};

import ThermostatIcon from '@mui/icons-material/Thermostat';
import type { FC } from 'react';

import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { BigDisplay, InfoCard, InfoField } from '~components';

interface ServerOverviewCardProps {
  serverHealth: ServerHealth;
}

export const ServerOverviewCard: FC<ServerOverviewCardProps> = ({ serverHealth }) => (
  <InfoCard title="Overview" subtitle="General status" icon={<ThermostatIcon />}>
    <InfoField label="App version">
      <BigDisplay content={serverHealth.server?.appVersion} />
    </InfoField>
    <InfoField label="Node.js version">
      <BigDisplay content={serverHealth.server?.nodeVersion} />
    </InfoField>
  </InfoCard>
);

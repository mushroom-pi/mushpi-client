import DataUsageIcon from '@mui/icons-material/DataUsage';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Box, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import { BigDisplay } from '~comp/BigDisplay';
import { InfoCard } from '~comp/InfoCard';
import { InfoField } from '~comp/InfoField';
import { Loading } from '~comp/Loading';
import { ReadableTime } from '~comp/ReadableTime';
import { useServerHealth } from '~hook/useServerHealth';
import { Page } from '~layout/Page';

function severityColorForLoad(load?: number | null) {
  if (!load) return 'inherit';
  if (load >= 0.9) return 'error.main';
  if (load >= 0.75) return 'warning.main';
  return 'success.main';
}

export const Server: FC = () => {
  const { data: serverHealth, error } = useServerHealth();
  const isHealthy = !!serverHealth?.server?.healthy && !error;

  return (
    <Page>
      {serverHealth ? (
        <>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4">Server</Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start" mb={2}>
            <Chip
              label={isHealthy ? 'Healthy' : 'Unhealthy'}
              color={isHealthy ? 'success' : 'error'}
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              {serverHealth.server?.environment + ' environment'}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={4}>
              <InfoCard title="Overview" subtitle="General status" icon={<ThermostatIcon />}>
                <InfoField label="App version">
                  <BigDisplay content={serverHealth.server?.appVersion} />
                </InfoField>
                <InfoField label="Node.js version">
                  <BigDisplay content={serverHealth.server?.nodeVersion} />
                </InfoField>
              </InfoCard>
            </Grid>

            <Grid size={4}>
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
            </Grid>
          </Grid>
        </>
      ) : (
        <Loading />
      )}
    </Page>
  );
};

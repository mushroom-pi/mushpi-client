import DataUsageIcon from '@mui/icons-material/DataUsage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Button, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import { BigDisplay, Error, InfoCard, InfoField, PageTitle, ReadableTime } from '~components';
import { useServerHealth } from '~hook/useServerHealth';
import { Page } from '~layout/Page';

import { ServerSkeleton } from './components/ServerSkeleton';

function severityColorForLoad(load?: number | null) {
  if (!load) return 'inherit';
  if (load >= 0.9) return 'error.main';
  if (load >= 0.75) return 'warning.main';
  return 'success.main';
}

export const Server: FC = () => {
  const { data: serverHealth, isLoading, isError, error, refetch } = useServerHealth();
  const isHealthy = !!serverHealth?.server?.healthy && !error;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const docsPath = import.meta.env.VITE_DOCS_PATH as string | undefined;
  const docsUrl =
    apiBaseUrl && docsPath ? `${apiBaseUrl}/${docsPath}` : undefined;

  let content: React.ReactNode;

  if (isLoading) {
    content = <ServerSkeleton />;
  } else if (isError || !serverHealth) {
    content = <Error item="server health" error={error} refetch={refetch} />;
  } else {
    content = (
      <>
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoCard title="Overview" subtitle="General status" icon={<ThermostatIcon />}>
              <InfoField label="App version">
                <BigDisplay content={serverHealth.server?.appVersion} />
              </InfoField>
              <InfoField label="Node.js version">
                <BigDisplay content={serverHealth.server?.nodeVersion} />
              </InfoField>
            </InfoCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
    );
  }

  return (
    <Page>
      <PageTitle
        actions={
          !isLoading && !isError && docsUrl ? (
            <Button
              component="a"
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<MenuBookIcon />}
            >
              API Docs
            </Button>
          ) : undefined
        }
      >
        Server
      </PageTitle>
      {content}
    </Page>
  );
};

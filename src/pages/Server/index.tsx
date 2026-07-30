import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorageIcon from '@mui/icons-material/Storage';
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

function formatTableSize(sizeMb: number | null, rowCount?: number): string {
  if (sizeMb != null) {
    return sizeMb < 0.01 ? `${(sizeMb * 1024).toFixed(1)} KB` : `${sizeMb.toFixed(2)} MB`;
  }
  return `${(rowCount ?? 0).toLocaleString()} rows`;
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoCard title="Database" subtitle="SQLite storage" icon={<StorageIcon />}>
              <InfoField label="Total size">
                {serverHealth.databases?.sqlite?.size?.totalMb != null ? (
                  <BigDisplay content={`${serverHealth.databases.sqlite.size.totalMb.toFixed(2)} MB`} />
                ) : (
                  <BigDisplay content="In-memory" />
                )}
              </InfoField>
              <Stack direction="row" spacing={1} mt={0.5} mb={1}>
                <Chip
                  icon={serverHealth.databases?.sqlite?.read ? <CheckIcon /> : <CloseIcon />}
                  label={serverHealth.databases?.sqlite?.read ? 'Read OK' : 'Read failed'}
                  size="small"
                  color={serverHealth.databases?.sqlite?.read ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  icon={serverHealth.databases?.sqlite?.write ? <CheckIcon /> : <CloseIcon />}
                  label={serverHealth.databases?.sqlite?.write ? 'Write OK' : 'Write failed'}
                  size="small"
                  color={serverHealth.databases?.sqlite?.write ? 'success' : 'error'}
                  variant="outlined"
                />
              </Stack>
              {serverHealth.databases?.sqlite?.size?.path && (
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  {serverHealth.databases.sqlite.size.path}
                </Typography>
              )}
              {serverHealth.databases?.sqlite?.size?.tables &&
                serverHealth.databases.sqlite.size.tables.length > 0 && (
                  <>
                    <Typography variant="overline" color="text.secondary">
                      Top tables
                    </Typography>
                    {serverHealth.databases.sqlite.size.tables.slice(0, 6).map((table) => (
                      <Stack
                        key={table.name}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" noWrap>
                          {table.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTableSize(table.sizeMb, table.rowCount)}
                        </Typography>
                      </Stack>
                    ))}
                    {serverHealth.databases.sqlite.size.overheadMb != null &&
                     serverHealth.databases.sqlite.size.overheadMb > 0 && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography variant="body2" noWrap color="text.secondary">
                          Overhead (WAL, free pages)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {serverHealth.databases.sqlite.size.overheadMb.toFixed(2)} MB
                        </Typography>
                      </Stack>
                    )}
                  </>
                )}
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

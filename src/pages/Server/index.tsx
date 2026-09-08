import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import { Error, PageTitle } from '~components';
import { useServerHealth } from '~hook/useServerHealth';
import { Page } from '~layout/Page';
import { API_BASE } from '~utils/apiUrl';

import { ServerDatabaseCard } from './components/ServerDatabaseCard';
import { ServerOverviewCard } from './components/ServerOverviewCard';
import { ServerResourcesCard } from './components/ServerResourcesCard';
import { ServerSkeleton } from './components/ServerSkeleton';

export const Server: FC = () => {
  const { data: serverHealth, isLoading, isError, error, refetch } = useServerHealth();
  const isHealthy = !!serverHealth?.server?.healthy && !error;

  // API_BASE is normalized (trailing slashes stripped), so a same-origin prod
  // build (`VITE_API_BASE_URL = /` → `''`) yields `/contract`, not `//contract`.
  const docsPath = import.meta.env.VITE_DOCS_PATH as string | undefined;
  const docsUrl = docsPath ? `${API_BASE}/${docsPath}` : undefined;

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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ServerOverviewCard serverHealth={serverHealth} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <ServerResourcesCard serverHealth={serverHealth} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <ServerDatabaseCard serverHealth={serverHealth} />
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

import { Box, Grid, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { Error, PageTitle } from '~components';
import { useDashboard } from '~hook/useDashboard';
import { Page } from '~layout/Page';

import { ActiveBatchesWidget } from './components/ActiveBatchesWidget';
import { ApproachingCompletionWidget } from './components/ApproachingCompletionWidget';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { MostUsedRecipesWidget } from './components/MostUsedRecipesWidget';
import { RecentlyFinishedWidget } from './components/RecentlyFinishedWidget';
import { StatsRow } from './components/StatsRow';
import { UnitCards } from './components/UnitCards';
import { WarningsBanner } from './components/WarningsBanner';

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const navigate = useNavigate();

  let content: React.ReactNode;

  if (isLoading) {
    content = <DashboardSkeleton />;
  } else if (isError) {
    content = <Error item="dashboard" error={error} refetch={refetch} />;
  } else {
    const { units, batches, recipes, stats, warnings } = data!;

    const unitNames = new Map<number, string>(
      units.items.map((u) => [u.id, u.name ?? u.handle]),
    );

    if (units.items.length === 0 && units.total === 0) {
      content = (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No Pico units connected yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Set up a Pico unit to get started.
          </Typography>
          <Link component="button" onClick={() => navigate('/pico-units')}>
            Go to Pico Units
          </Link>
        </Box>
      );
    } else {
      content = (
        <>
          <WarningsBanner warnings={warnings} unitNames={unitNames} />
          <StatsRow
            units={units.total}
            activeBatches={batches.active}
            totalBatches={batches.total}
            totalReadings={stats.totalReadings}
          />
          <UnitCards
            items={units.items}
            healthy={units.healthy}
            degraded={units.degraded}
            offline={units.offline}
            total={units.total}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ActiveBatchesWidget items={units.items} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ApproachingCompletionWidget batches={batches.approachingCompletion} />
              <RecentlyFinishedWidget batches={batches.recentlyFinished} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <MostUsedRecipesWidget recipes={recipes.mostUsed} />
          </Box>
        </>
      );
    }
  }

  return (
    <Page>
      <PageTitle>Dashboard</PageTitle>
      {content}
    </Page>
  );
}

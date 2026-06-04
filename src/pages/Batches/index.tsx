import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BatchesControllerListStatusEnum } from '~api/generated';
import { Error, Loading, PageTitle } from '~components';
import { useListBatches } from '~ctx/Batches';
import { Page } from '~layout/Page';

import { BatchesTable } from './components/BatchesTable';
import { CreateBatchDialog } from './components/CreateBatchDialog';

type BatchStatus =
  (typeof BatchesControllerListStatusEnum)[keyof typeof BatchesControllerListStatusEnum];

type StatusFilter = 'all' | BatchStatus;

export default function BatchesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useListBatches({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  if (isLoading && !data) {
    return <Loading item="batches" />;
  }

  if (isError && !data) {
    return <Error item="batches" error={error} refetch={() => void refetch()} />;
  }

  const batches = data?.items ?? [];

  return (
    <Page>
      <PageTitle
        mb={1.5}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New Batch
          </Button>
        }
      >
        Batches
      </PageTitle>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing page {data?.page ?? 1} of {data?.pages ?? 1} — total: {data?.total ?? 0}
      </Typography>

      <Stack spacing={2.5}>
        <ToggleButtonGroup
          exclusive
          value={statusFilter}
          onChange={(_, value: StatusFilter | null) => {
            if (value) setStatusFilter(value);
          }}
          size="small"
          aria-label="Batch status filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value={BatchesControllerListStatusEnum.Planned}>Planned</ToggleButton>
          <ToggleButton value={BatchesControllerListStatusEnum.InProgress}>
            In Progress
          </ToggleButton>
          <ToggleButton value={BatchesControllerListStatusEnum.Finished}>Finished</ToggleButton>
        </ToggleButtonGroup>

        <BatchesTable batches={batches} onRowClick={(id) => navigate(`/batches/${id}`)} />
      </Stack>

      <CreateBatchDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Page>
  );
}

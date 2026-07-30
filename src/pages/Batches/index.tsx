import { Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BatchesControllerListV1StatusEnum } from '~api/generated';
import { AddNew, Error, PageTitle, TableSkeleton } from '~components';
import { useListBatches } from '~ctx/Batches';
import { Page } from '~layout/Page';

import { BatchesTable } from './components/BatchesTable';
import { CreateBatchDialog } from './components/CreateBatchDialog';

type BatchStatus =
  (typeof BatchesControllerListV1StatusEnum)[keyof typeof BatchesControllerListV1StatusEnum];

type StatusFilter = 'all' | BatchStatus;

export default function BatchesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useListBatches({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const batches = data?.items ?? [];

  let content: React.ReactNode;

  if (isLoading && !data) {
    content = (
      <>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <TableSkeleton columns={7} rows={6} />
      </>
    );
  } else if (isError && !data) {
    content = <Error compact item="batches" error={error} refetch={() => void refetch()} />;
  } else {
    content = (
      <>
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
            <ToggleButton value={BatchesControllerListV1StatusEnum.Planned}>Planned</ToggleButton>
            <ToggleButton value={BatchesControllerListV1StatusEnum.InProgress}>
              In Progress
            </ToggleButton>
            <ToggleButton value={BatchesControllerListV1StatusEnum.Finished}>Finished</ToggleButton>
          </ToggleButtonGroup>

          <BatchesTable batches={batches} onRowClick={(id) => navigate(`/batches/${id}`)} />
        </Stack>
      </>
    );
  }

  return (
    <Page>
      <PageTitle
        mb={1.5}
        actions={
          (isLoading || isError) && !data ? (
            <Skeleton variant="rounded" width={130} height={36} />
          ) : (
            <AddNew onClick={() => setCreateOpen(true)}>New Batch</AddNew>
          )
        }
      >
        Batches
      </PageTitle>

      {content}

      <CreateBatchDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Page>
  );
}

import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';

import { Error, Invalid, Loading, PageTitle } from '~components';
import { BatchProvider, useBatchContext } from '~ctx/Batch';
import { BatchChartsProvider } from '~ctx/Charts';
import { Page } from '~layout/Page';

import { ChartsTabs } from '../Readings/components/ChartsTabs/ChartsTabs';
import { BatchMeta } from './components/BatchMeta';

function BatchDetailInner() {
  const { batch, isLoading, isError, error, refetch } = useBatchContext();

  if (isLoading) {
    return <Loading item="batch" />;
  }

  if (isError || !batch) {
    return <Error item="batch" error={error} refetch={refetch} />;
  }

  return (
    <Page>
      <BatchMeta />
      <Box mt={3}>
        <PageTitle mb={2}>Batch Readings</PageTitle>
        <BatchChartsProvider batchId={batch.id} batch={batch}>
          <ChartsTabs />
        </BatchChartsProvider>
      </Box>
    </Page>
  );
}

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const batchId = id ? Number(id) : null;

  if (batchId == null || Number.isNaN(batchId)) {
    return <Invalid item="batch id" />;
  }

  return (
    <BatchProvider batchId={batchId}>
      <BatchDetailInner />
    </BatchProvider>
  );
}

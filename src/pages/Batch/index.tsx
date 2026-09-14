import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ChartsTabs,
  DeleteButton,
  EditButton,
  Error,
  Invalid,
  ItemPage,
  PageTitle,
  ReadingsCsvDownloadButton,
  StatusChip,
} from '~components';
import { BatchProvider, useBatchContext } from '~ctx/Batch';
import { BatchChartsProvider } from '~ctx/Charts';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import { useExportBatchReadingsCmd } from '~hook/useBatchReadings';
import { useDocumentTitle } from '~hook/useDocumentTitle';

import { BatchDetailSkeleton } from './components/BatchDetailSkeleton';
import { BatchMeta } from './components/BatchMeta';
import { DeleteBatchDialog } from './components/DeleteBatchDialog';
import { EditBatchDialog } from './components/EditBatchDialog';
import { SaveAsRecipeDialog } from './components/SaveAsRecipeDialog';

function BatchDetailInner() {
  const navigate = useNavigate();
  const { batch, isLoading, isError, error, refetch } = useBatchContext();
  const { id } = useParams<{ id: string }>();
  useDocumentTitle(batch?.description ?? (id ? `Batch #${id}` : 'Batch'));
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveRecipeOpen, setSaveRecipeOpen] = useState(false);
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);
  const exportCsv = useExportBatchReadingsCmd();
  const { run } = useAsyncWithToast();

  if (isLoading) {
    return <BatchDetailSkeleton />;
  }

  if (isError || !batch) {
    return <Error item="batch" error={error} refetch={refetch} />;
  }

  const downloadBatchCsv = async () => {
    if (!batch) return;
    setIsFetchingCsv(true);
    try {
      await run(
        async () => {
          const blob = await exportCsv({
            batchId: batch.id,
            start: batch.start_at,
            ...(batch.finish_at ? { end: batch.finish_at } : {}),
          });

          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = `readings-batch-${batch.id}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objectUrl);
        },
        { fallbackErrorMessage: 'Failed to download CSV', rethrow: true },
      );
    } catch {
      // run() already showed the error toast
    } finally {
      setIsFetchingCsv(false);
    }
  };

  return (
    <ItemPage
      title={batch.description ?? `Batch #${batch.id}`}
      titleAdornment={<StatusChip status={batch.status} />}
      actions={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {batch.status === 'finished' && (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setSaveRecipeOpen(true)}
            >
              Save as Recipe
            </Button>
          )}
          <EditButton onClick={() => setEditOpen(true)} />
          <DeleteButton onClick={() => setDeleteOpen(true)} />
        </Stack>
      }
    >
      <BatchMeta />
      <Box mt={3}>
        <PageTitle
          mb={2}
          actions={
            <ReadingsCsvDownloadButton
              onClick={downloadBatchCsv}
              isLoading={isFetchingCsv}
              disabled={!batch.start_at}
              tooltip="Downloads all raw readings for this batch — no aggregation applied"
            />
          }
        >
          Batch Readings
        </PageTitle>
        <BatchChartsProvider batchId={batch.id} batch={batch}>
          <ChartsTabs />
        </BatchChartsProvider>
      </Box>
      <EditBatchDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteBatchDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => navigate('/batches')}
      />
      <SaveAsRecipeDialog open={saveRecipeOpen} onClose={() => setSaveRecipeOpen(false)} />
    </ItemPage>
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

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePicoUnitBatches, usePicoUnitCurrentBatch } from '~ctx/Batches';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { BatchesTable } from '~pages/Batches/components/BatchesTable';
import { CreateBatchDialog } from '~pages/Batches/components/CreateBatchDialog';

export const PicoUnitBatches: React.FC = () => {
  const navigate = useNavigate();
  const { pico } = usePicoUnitContext();
  const picoUnitId = pico?.id ?? null;

  const [createOpen, setCreateOpen] = useState(false);

  const { data: batchesData, isLoading } = usePicoUnitBatches(picoUnitId);
  const { data: currentBatch } = usePicoUnitCurrentBatch(picoUnitId);

  const batches = [...(batchesData?.items ?? [])].sort(
    (a, b) => dayjs(b.start_at).valueOf() - dayjs(a.start_at).valueOf(),
  );

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h6">Batches</Typography>
          <IconButton size="small" onClick={() => setCreateOpen(true)} title="New batch">
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <BatchesTable
            batches={batches}
            onRowClick={(id) => navigate(`/batches/${id}`)}
            hideUnitColumn
            activeId={currentBatch?.id}
            disablePaper
          />
        )}

        {picoUnitId != null && (
          <CreateBatchDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            defaultValues={{ picoUnitId }}
          />
        )}
      </CardContent>
    </Card>
  );
};

import AddIcon from '@mui/icons-material/Add';
import { Box, CircularProgress, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BatchesTable, CreateBatchDialog, InfoCard } from '~components';
import { usePicoUnitBatches, usePicoUnitCurrentBatch } from '~ctx/Batches';
import { usePicoUnitContext } from '~ctx/PicoUnit';

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
    <>
      <InfoCard
        title="Batches"
        headerAction={
          <IconButton size="small" onClick={() => setCreateOpen(true)} title="New batch">
            <AddIcon fontSize="small" />
          </IconButton>
        }
      >
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
      </InfoCard>

      {picoUnitId != null && (
        <CreateBatchDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          defaultValues={{ picoUnitId }}
        />
      )}
    </>
  );
};

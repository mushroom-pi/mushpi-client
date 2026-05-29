import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch, BatchStatusEnum, CreateBatchDto } from '~api/generated';
import { batchKeys } from '~api/queryKeys';
import { usePicoUnitBatches, usePicoUnitCurrentBatch } from '~ctx/Batches';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return dayjs(iso).format('DD MMM YYYY HH:mm');
}

function StatusChip({ batch }: { batch: Batch }) {
  const STATUS_LABEL: Record<BatchStatusEnum, string> = {
    planned: 'Planned',
    'in-progress': 'In progress',
    finished: 'Finished',
  };
  const STATUS_COLOR: Record<BatchStatusEnum, 'info' | 'warning' | 'success'> = {
    planned: 'info',
    'in-progress': 'warning',
    finished: 'success',
  };
  return (
    <Chip
      label={STATUS_LABEL[batch.status]}
      color={STATUS_COLOR[batch.status]}
      size="small"
    />
  );
}

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  picoUnitId: number;
}

function CreateBatchDialog({ open, onClose, picoUnitId }: CreateBatchDialogProps) {
  const qc = useQueryClient();
  const { run } = useAsyncWithToast();

  const [startAt, setStartAt] = useState(() => dayjs().format('YYYY-MM-DDTHH:mm'));
  const [species, setSpecies] = useState('');
  const [temperatureTarget, setTemperatureTarget] = useState('');
  const [humidityTarget, setHumidityTarget] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: async (dto: CreateBatchDto) => {
      const res = await unwrap(Batches.batchesControllerCreate({ createBatchDto: dto }));
      return res as unknown as Batch;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: batchKeys.all });
    },
  });

  async function handleSubmit() {
    const dto: CreateBatchDto = {
      pico_unit_id: picoUnitId,
      start_at: new Date(startAt).toISOString(),
      species: species || undefined,
      temperature_target: temperatureTarget ? Number(temperatureTarget) : undefined,
      humidity_target: humidityTarget ? Number(humidityTarget) : undefined,
      notes: notes || undefined,
    };
    await run(() => mutation.mutateAsync(dto), {
      successMessage: 'Batch created',
      fallbackErrorMessage: 'Failed to create batch',
      onSuccess: () => onClose(),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Batch</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          <TextField
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            fullWidth
          />
          <TextField
            label="Temperature Target (°C)"
            type="number"
            value={temperatureTarget}
            onChange={(e) => setTemperatureTarget(e.target.value)}
            fullWidth
            slotProps={{ input: { inputProps: { min: 0, max: 50 } } }}
          />
          <TextField
            label="Humidity Target (%)"
            type="number"
            value={humidityTarget}
            onChange={(e) => setHumidityTarget(e.target.value)}
            fullWidth
            slotProps={{ input: { inputProps: { min: 20, max: 90 } } }}
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const PicoUnitBatches: React.FC = () => {
  const navigate = useNavigate();
  const { pico } = usePicoUnitContext();
  const picoUnitId = pico?.id ?? null;

  const [createOpen, setCreateOpen] = useState(false);

  const { data: batchesData, isLoading } = usePicoUnitBatches(picoUnitId);
  const { data: currentBatch } = usePicoUnitCurrentBatch(picoUnitId);

  const batches = batchesData?.items ?? [];

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
        ) : batches.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No batches for this unit
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Start</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch) => (
                <TableRow
                  key={batch.id}
                  hover
                  onClick={() => navigate(`/batches/${batch.id}`)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: currentBatch?.id === batch.id ? 'action.selected' : undefined,
                  }}
                >
                  <TableCell>{formatDate(batch.start_at)}</TableCell>
                  <TableCell>{batch.finish_at ? formatDate(batch.finish_at) : '—'}</TableCell>
                  <TableCell>{batch.species ?? '—'}</TableCell>
                  <TableCell>
                    <StatusChip batch={batch} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {picoUnitId != null && (
          <CreateBatchDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            picoUnitId={picoUnitId}
          />
        )}
      </CardContent>
    </Card>
  );
};

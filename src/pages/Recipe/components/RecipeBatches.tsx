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
  MenuItem,
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import type { Batch, CreateBatchDto, Recipe } from '~api/generated';
import { batchKeys, recipeKeys } from '~api/queryKeys';
import { usePicoUnitsContext } from '~ctx/PicoUnits';
import { useRecipeContext } from '~ctx/Recipe';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

type CreateBatchErrors = {
  pico_unit_id?: string;
  start_at?: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return dayjs(iso).format('DD MMM YYYY HH:mm');
}

function StatusChip({ batch }: { batch: Batch }) {
  const isFinished = !!batch.finish_at;

  return (
    <Chip
      label={isFinished ? 'Finished' : 'In progress'}
      color={isFinished ? 'success' : 'warning'}
      size="small"
    />
  );
}

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
}

function CreateBatchDialog({ open, onClose, recipe }: CreateBatchDialogProps) {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();
  const { units, selectedUnitId } = usePicoUnitsContext();
  const [picoUnitId, setPicoUnitId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<CreateBatchErrors>({});

  useEffect(() => {
    if (!open) return;
    setPicoUnitId(selectedUnitId != null ? String(selectedUnitId) : '');
    setStartAt(dayjs().format('YYYY-MM-DDTHH:mm'));
    setNotes('');
    setErrors({});
  }, [open, selectedUnitId]);

  const mutation = useMutation({
    mutationFn: async (dto: CreateBatchDto) => {
      return unwrap<Batch>(Batches.batchesControllerCreate({ createBatchDto: dto }));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: batchKeys.all }),
        queryClient.invalidateQueries({ queryKey: recipeKeys.batches(recipe.id) }),
      ]);
    },
  });

  function handleClose() {
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: CreateBatchErrors = {};
    if (!picoUnitId) nextErrors.pico_unit_id = 'Pico unit is required';
    if (!startAt) nextErrors.start_at = 'Start time is required';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const dto: CreateBatchDto = {
      recipe_id: recipe.id,
      pico_unit_id: Number(picoUnitId),
      start_at: dayjs(startAt).toISOString(),
      species: recipe.species,
      temperature_target: recipe.temperature_target,
      humidity_target: recipe.humidity_target,
      notes: notes.trim() || undefined,
    };

    await run(() => mutation.mutateAsync(dto), {
      successMessage: 'Batch created',
      fallbackErrorMessage: 'Failed to create batch',
      onSuccess: () => handleClose(),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Start Batch</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="create-batch-form" spacing={2} mt={0.5} onSubmit={handleSubmit}>
          <Typography variant="body2" color="text.secondary">
            This batch will use {recipe.species} at {recipe.temperature_target} °C and{' '}
            {recipe.humidity_target}% humidity.
          </Typography>

          <TextField
            select
            label="Pico unit"
            value={picoUnitId}
            onChange={(event) => {
              setPicoUnitId(event.target.value);
              setErrors((current) => ({ ...current, pico_unit_id: undefined }));
            }}
            error={!!errors.pico_unit_id}
            helperText={
              errors.pico_unit_id ?? (units.length === 0 ? 'No pico units available' : undefined)
            }
            required
            fullWidth
          >
            {units.map((unit) => (
              <MenuItem key={unit.id} value={String(unit.id)}>
                {unit.name ?? unit.handle}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(event) => {
              setStartAt(event.target.value);
              setErrors((current) => ({ ...current, start_at: undefined }));
            }}
            error={!!errors.start_at}
            helperText={errors.start_at}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-batch-form"
          variant="contained"
          disabled={mutation.isPending || units.length === 0}
        >
          {mutation.isPending ? 'Starting…' : 'Start batch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RecipeBatches() {
  const navigate = useNavigate();
  const { recipe, recipeBatches, isBatchesLoading } = useRecipeContext();
  const [createOpen, setCreateOpen] = useState(false);

  if (!recipe) return null;

  const batches = recipeBatches ?? [];

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6">Batches using this recipe</Typography>
            <Button variant="outlined" onClick={() => setCreateOpen(true)}>
              Start Batch
            </Button>
          </Stack>

          {isBatchesLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : batches.length === 0 ? (
            <Typography color="text.secondary">No batches are using this recipe yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Species</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Finish</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    hover
                    onClick={() => navigate(`/batches/${batch.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{batch.pico_unit.name ?? batch.pico_unit.handle}</TableCell>
                    <TableCell>{batch.species ?? '—'}</TableCell>
                    <TableCell>{formatDate(batch.start_at)}</TableCell>
                    <TableCell>
                      {batch.finish_at ? formatDate(batch.finish_at) : 'In progress'}
                    </TableCell>
                    <TableCell>
                      <StatusChip batch={batch} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateBatchDialog open={createOpen} onClose={() => setCreateOpen(false)} recipe={recipe} />
    </>
  );
}

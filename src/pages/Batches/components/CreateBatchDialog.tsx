import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import { BatchesControllerListStatusEnum, type Batch, type CreateBatchDto } from '~api/generated';
import { batchKeys } from '~api/queryKeys';
import { useListBatches } from '~ctx/Batches';
import { useListPicoUnits } from '~ctx/PicoUnits';
import { useListRecipes } from '~ctx/Recipes';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

const toDateTimeLocal = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : dayjs().format('YYYY-MM-DDTHH:mm');

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    picoUnitId?: number;
    recipeId?: number;
    description?: string;
    species?: string;
    temperatureTarget?: number;
    humidityTarget?: number;
  };
}

export const CreateBatchDialog = ({ open, onClose, defaultValues }: CreateBatchDialogProps) => {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();

  const [picoUnitId, setPicoUnitId] = useState('');
  const [startAt, setStartAt] = useState(toDateTimeLocal());
  const [finishAt, setFinishAt] = useState('');
  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState('');
  const [temperatureTarget, setTemperatureTarget] = useState('');
  const [humidityTarget, setHumidityTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [recipeId, setRecipeId] = useState('');

  const { data: picoUnitsData } = useListPicoUnits({ limit: 100 }, { enabled: open });
  const { data: recipesData } = useListRecipes({ limit: 100 }, { enabled: open });
  const { data: activeBatchesData } = useListBatches(
    { status: BatchesControllerListStatusEnum.InProgress, limit: 100 },
    { enabled: open },
  );

  const picoUnits = picoUnitsData?.items ?? [];
  const recipes = recipesData?.items ?? [];

  const activeBatchByUnitId = useMemo(() => {
    const map = new Map<number, Batch>();
    for (const batch of activeBatchesData?.items ?? []) {
      map.set(batch.pico_unit_id, batch);
    }
    return map;
  }, [activeBatchesData]);

  const busyUnitIds = useMemo(() => new Set(activeBatchByUnitId.keys()), [activeBatchByUnitId]);

  const activeBatch = picoUnitId ? activeBatchByUnitId.get(Number(picoUnitId)) : undefined;

  const startAtConflict = useMemo(() => {
    if (!activeBatch) return null;
    if (!activeBatch.finish_at) {
      return 'This unit has an active batch with no scheduled end — future batches cannot be planned.';
    }
    if (!dayjs(startAt).isAfter(dayjs(activeBatch.finish_at))) {
      return `Start must be after the active batch ends (${toDateTimeLocal(activeBatch.finish_at)}).`;
    }
    return null;
  }, [activeBatch, startAt]);

  useEffect(() => {
    if (!open) return;

    setPicoUnitId(defaultValues?.picoUnitId != null ? String(defaultValues.picoUnitId) : '');
    setStartAt(toDateTimeLocal());
    setFinishAt('');
    setDescription(defaultValues?.description ?? '');
    setSpecies(defaultValues?.species ?? '');
    setTemperatureTarget(
      defaultValues?.temperatureTarget != null ? String(defaultValues.temperatureTarget) : '',
    );
    setHumidityTarget(
      defaultValues?.humidityTarget != null ? String(defaultValues.humidityTarget) : '',
    );
    setNotes('');
    setRecipeId(defaultValues?.recipeId != null ? String(defaultValues.recipeId) : '');
  }, [defaultValues, open]);

  // When active-batch data loads after dialog is already open, auto-adjust startAt if it conflicts.
  // recipeId and recipes are intentionally read from the closure at effect-run time (not in deps)
  // to avoid re-running on every keystroke in the Start field.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open || !picoUnitId) return;
    const active = activeBatchByUnitId.get(Number(picoUnitId));
    if (!active?.finish_at) return;
    if (dayjs(startAt).isAfter(dayjs(active.finish_at))) return;
    const newStartAt = dayjs(active.finish_at).add(1, 'minute').format('YYYY-MM-DDTHH:mm');
    setStartAt(newStartAt);
    if (recipeId) {
      const recipe = recipes.find((r) => String(r.id) === recipeId);
      if (recipe) setFinishAt(dayjs(newStartAt).add(recipe.duration_days, 'day').format('YYYY-MM-DDTHH:mm'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, picoUnitId, activeBatchByUnitId]);

  function computeFinishAt(start: string, durationDays: number) {
    return dayjs(start).add(durationDays, 'day').format('YYYY-MM-DDTHH:mm');
  }

  function handleRecipeChange(newRecipeId: string) {
    setRecipeId(newRecipeId);
    if (!newRecipeId) return;
    const recipe = recipes.find((r) => String(r.id) === newRecipeId);
    if (!recipe) return;
    setSpecies(recipe.species);
    setTemperatureTarget(String(recipe.temperature_target));
    setHumidityTarget(String(recipe.humidity_target));
    setFinishAt(computeFinishAt(startAt, recipe.duration_days));
  }

  function handleStartAtChange(newStartAt: string) {
    setStartAt(newStartAt);
    if (!recipeId) return;
    const recipe = recipes.find((r) => String(r.id) === recipeId);
    if (!recipe) return;
    setFinishAt(computeFinishAt(newStartAt, recipe.duration_days));
  }

  function handleUnitChange(newUnitId: string) {
    setPicoUnitId(newUnitId);
    const active = newUnitId ? activeBatchByUnitId.get(Number(newUnitId)) : undefined;
    if (!active?.finish_at) return;
    if (dayjs(startAt).isAfter(dayjs(active.finish_at))) return;
    const newStartAt = dayjs(active.finish_at).add(1, 'minute').format('YYYY-MM-DDTHH:mm');
    setStartAt(newStartAt);
    if (recipeId) {
      const recipe = recipes.find((r) => String(r.id) === recipeId);
      if (recipe) setFinishAt(computeFinishAt(newStartAt, recipe.duration_days));
    }
  }

  const mutation = useMutation<Batch, unknown, CreateBatchDto>({
    mutationFn: async (createBatchDto) => {
      return unwrap<Batch>(Batches.batchesControllerCreate({ createBatchDto }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });

  const canSubmit = useMemo(() => {
    return picoUnitId.trim() !== '' && startAt.trim() !== '' && !startAtConflict;
  }, [picoUnitId, startAt, startAtConflict]);

  const handleCreate = async () => {
    const dto: CreateBatchDto = {
      pico_unit_id: Number(picoUnitId),
      start_at: dayjs(startAt).toISOString(),
      finish_at: finishAt ? dayjs(finishAt).toISOString() : null,
      description: description.trim() || undefined,
      species: species.trim() || undefined,
      temperature_target: temperatureTarget === '' ? undefined : Number(temperatureTarget),
      humidity_target: humidityTarget === '' ? undefined : Number(humidityTarget),
      notes: notes.trim() || undefined,
      recipe_id: recipeId === '' ? undefined : Number(recipeId),
    };

    await run(() => mutation.mutateAsync(dto), {
      successMessage: 'Batch created successfully',
      fallbackErrorMessage: 'Failed to create batch',
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Batch</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          <FormControl fullWidth required>
            <InputLabel id="create-batch-unit-label">Pico Unit</InputLabel>
            <Select
              labelId="create-batch-unit-label"
              value={picoUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              label="Pico Unit"
            >
              {picoUnits.map((unit) => {
                const isBusy = busyUnitIds.has(unit.id);
                return (
                  <MenuItem
                    key={unit.id}
                    value={String(unit.id)}
                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box>{unit.name ?? unit.handle}</Box>
                    {isBusy && (
                      <Typography variant="caption" color="warning.main">
                        ⚠ Active batch — future start only
                      </Typography>
                    )}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="create-batch-recipe-label">Recipe</InputLabel>
            <Select
              labelId="create-batch-recipe-label"
              value={recipeId}
              onChange={(e) => handleRecipeChange(e.target.value)}
              label="Recipe"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {recipes.map((recipe) => (
                <MenuItem key={recipe.id} value={String(recipe.id)}>
                  {recipe.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            placeholder="Optional name or label for this batch"
          />

          <TextField
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(event) => handleStartAtChange(event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!startAtConflict}
            helperText={startAtConflict ?? undefined}
          />
          <TextField
            label="Finish"
            type="datetime-local"
            value={finishAt}
            onChange={(event) => setFinishAt(event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Species"
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
            fullWidth
          />
          <TextField
            label="Temperature Target (°C)"
            type="number"
            value={temperatureTarget}
            onChange={(event) => setTemperatureTarget(event.target.value)}
            fullWidth
          />
          <TextField
            label="Humidity Target (%)"
            type="number"
            value={humidityTarget}
            onChange={(event) => setHumidityTarget(event.target.value)}
            fullWidth
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
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!canSubmit || mutation.isPending}
        >
          {mutation.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

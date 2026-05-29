import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { unwrap } from '~api/adapter';
import { Batches } from '~api/client';
import { type Batch, BatchesControllerListStatusEnum, type CreateBatchDto } from '~api/generated';
import { batchKeys } from '~api/queryKeys';
import { useListBatches } from '~ctx/Batches';
import { useListPicoUnits } from '~ctx/PicoUnits';
import { useListRecipes } from '~ctx/Recipes';
import { nowDateTimeLocal } from '~hook/BatchForm/methods';
import { useBatchFormFields } from '~hook/BatchForm/useBatchFormFields';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import { toDateTimeLocal } from '~utils/methods';

import type { CreateBatchDialogProps } from './interfaces';

export function useCreateBatchForm({
  open,
  onClose,
  onSuccess,
  defaultValues,
}: CreateBatchDialogProps) {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();

  const [picoUnitId, setPicoUnitId] = useState('');
  const [recipeId, setRecipeId] = useState('');

  const {
    description,
    setDescription,
    species,
    setSpecies,
    temperatureTarget,
    setTemperatureTarget,
    humidityTarget,
    setHumidityTarget,
    startAt,
    finishAt,
    setFinishAt,
    notes,
    setNotes,
    finishBeforeStartError,
    handleStartAtChange,
    resetFields,
  } = useBatchFormFields();

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

  const canSubmit = useMemo(() => {
    return (
      picoUnitId.trim() !== '' &&
      startAt.trim() !== '' &&
      !startAtConflict &&
      !finishBeforeStartError
    );
  }, [picoUnitId, startAt, startAtConflict, finishBeforeStartError]);

  // Reset all fields when the dialog opens.
  useEffect(() => {
    if (!open) return;
    setPicoUnitId(defaultValues?.picoUnitId != null ? String(defaultValues.picoUnitId) : '');
    setRecipeId(defaultValues?.recipeId != null ? String(defaultValues.recipeId) : '');
    resetFields({
      startAt: nowDateTimeLocal(),
      description: defaultValues?.description ?? '',
      species: defaultValues?.species ?? '',
      temperatureTarget:
        defaultValues?.temperatureTarget != null ? String(defaultValues.temperatureTarget) : '',
      humidityTarget:
        defaultValues?.humidityTarget != null ? String(defaultValues.humidityTarget) : '',
      finishAt: '',
      notes: '',
    });
  }, [defaultValues, open, resetFields]);

  // When active-batch data loads after the dialog is already open, auto-adjust startAt if it
  // conflicts with the selected unit's active batch. recipeId and recipes are intentionally read
  // from the closure at effect-run time (not in deps) to avoid re-running on every Start keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open || !picoUnitId) return;
    const active = activeBatchByUnitId.get(Number(picoUnitId));
    if (!active?.finish_at) return;
    if (dayjs(startAt).isAfter(dayjs(active.finish_at))) return;
    const newStartAt = dayjs(active.finish_at).add(1, 'minute').format('YYYY-MM-DDTHH:mm');
    handleStartAtChange(newStartAt, { recipeId, recipes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, picoUnitId, activeBatchByUnitId]);

  // When recipe data loads after the dialog is already open with a pre-selected recipe,
  // compute finishAt if the user hasn't set it yet. startAt and finishAt are read from the
  // closure at effect-run time (not in deps) to avoid re-running on every field change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open || !recipeId || finishAt) return;
    handleStartAtChange(startAt, { recipeId, recipes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipeId, recipesData]);

  function handleUnitChange(newUnitId: string) {
    setPicoUnitId(newUnitId);
    const active = newUnitId ? activeBatchByUnitId.get(Number(newUnitId)) : undefined;
    if (!active?.finish_at) return;
    if (dayjs(startAt).isAfter(dayjs(active.finish_at))) return;
    const newStartAt = dayjs(active.finish_at).add(1, 'minute').format('YYYY-MM-DDTHH:mm');
    handleStartAtChange(newStartAt, { recipeId, recipes });
  }

  function handleRecipeChange(newRecipeId: string) {
    setRecipeId(newRecipeId);
    if (!newRecipeId) return;
    const recipe = recipes.find((r) => String(r.id) === newRecipeId);
    if (!recipe) return;
    setSpecies(recipe.species);
    setTemperatureTarget(String(recipe.temperature_target));
    setHumidityTarget(String(recipe.humidity_target));
    handleStartAtChange(startAt, { recipeId: newRecipeId, recipes });
  }

  const mutation = useMutation<Batch, unknown, CreateBatchDto>({
    mutationFn: async (createBatchDto) => {
      return unwrap<Batch>(Batches.batchesControllerCreate({ createBatchDto }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: batchKeys.all });
    },
  });

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
      onSuccess: async () => {
        await onSuccess?.();
        onClose();
      },
    });
  };

  return {
    // field state
    picoUnitId,
    startAt,
    finishAt,
    description,
    species,
    temperatureTarget,
    humidityTarget,
    notes,
    recipeId,
    // direct setters (for fields without derived side-effects)
    setFinishAt,
    setDescription,
    setSpecies,
    setTemperatureTarget,
    setHumidityTarget,
    setNotes,
    // data
    picoUnits,
    recipes,
    busyUnitIds,
    // validation
    startAtConflict,
    finishBeforeStartError,
    canSubmit,
    // handlers
    handleUnitChange,
    handleRecipeChange,
    handleStartAtChange: (newStartAt: string) =>
      handleStartAtChange(newStartAt, { recipeId, recipes }),
    handleCreate,
    // mutation
    isPending: mutation.isPending,
  };
}

import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

import type { UpdateBatchDto } from '~api/generated';
import { useBatchContext } from '~ctx/Batch';
import { useBatchFormFields } from '~hook/BatchForm/useBatchFormFields';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import { toDateTimeLocal } from '~utils/methods';

import type { EditBatchDialogProps } from './interfaces';

export function useEditBatchForm({ open, onClose }: EditBatchDialogProps) {
  const { run } = useAsyncWithToast();
  const { batch, updateBatch } = useBatchContext();

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

  useEffect(() => {
    if (!open || !batch) return;
    resetFields({
      description: batch.description ?? '',
      species: batch.species ?? '',
      temperatureTarget: batch.temperature_target != null ? String(batch.temperature_target) : '',
      humidityTarget: batch.humidity_target != null ? String(batch.humidity_target) : '',
      startAt: toDateTimeLocal(batch.start_at),
      finishAt: toDateTimeLocal(batch.finish_at),
      notes: batch.notes ?? '',
    });
  }, [batch, open, resetFields]);

  const canSubmit = useMemo(
    () => startAt.trim() !== '' && !finishBeforeStartError,
    [startAt, finishBeforeStartError],
  );

  const handleUpdate = async () => {
    if (!batch) return;

    const body: UpdateBatchDto = {};

    const newDescription = description.trim() || null;
    if (newDescription !== (batch.description ?? null)) body.description = newDescription;

    const newSpecies = species.trim() || undefined;
    if (newSpecies !== (batch.species?.trim() || undefined)) body.species = newSpecies;

    const newTempTarget = temperatureTarget === '' ? undefined : Number(temperatureTarget);
    if (newTempTarget !== (batch.temperature_target ?? undefined))
      body.temperature_target = newTempTarget;

    const newHumTarget = humidityTarget === '' ? undefined : Number(humidityTarget);
    if (newHumTarget !== (batch.humidity_target ?? undefined)) body.humidity_target = newHumTarget;

    // Compare using datetime-local strings to avoid sub-minute precision false positives
    if (startAt !== toDateTimeLocal(batch.start_at)) body.start_at = dayjs(startAt).toISOString();

    if (finishAt !== toDateTimeLocal(batch.finish_at)) {
      body.finish_at = finishAt ? dayjs(finishAt).toISOString() : null;
    }

    if (notes !== (batch.notes ?? '')) body.notes = notes;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    try {
      await run(() => updateBatch.mutateAsync({ batchId: batch.id, body }), {
        successMessage: 'Batch updated successfully',
        fallbackErrorMessage: 'Failed to update batch',
        onSuccess: () => onClose(),
      });
    } catch {
      // Error already displayed via toast by run()
    }
  };

  return {
    description,
    setDescription,
    species,
    setSpecies,
    temperatureTarget,
    setTemperatureTarget,
    humidityTarget,
    setHumidityTarget,
    startAt,
    handleStartAtChange,
    finishAt,
    setFinishAt,
    notes,
    setNotes,
    finishBeforeStartError,
    canSubmit,
    handleUpdate,
    isPending: updateBatch.isLoading,
  };
}

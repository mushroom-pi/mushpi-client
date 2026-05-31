import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import type { BatchFormErrors, BatchFormFieldValues, StartAtChangeOpts } from './interfaces';
import { computeFinishAt, validate } from './methods';

/**
 * Shared form-field state for both CreateBatchDialog and EditBatchDialog.
 * Provides the 7 editable fields, finish-before-start validation,
 * handleStartAtChange (with optional finishAt recomputation), and resetFields.
 */
export function useBatchFormFields() {
  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState('');
  const [temperatureTarget, setTemperatureTarget] = useState('');
  const [humidityTarget, setHumidityTarget] = useState('');
  const [startAt, setStartAt] = useState('');
  const [finishAt, setFinishAt] = useState('');
  const [notes, setNotes] = useState('');

  const finishBeforeStartError = useMemo(() => {
    if (!finishAt || !startAt) return null;
    return dayjs(finishAt).isBefore(dayjs(startAt)) ? 'Finish must be after start' : null;
  }, [startAt, finishAt]);

  const errors = useMemo<BatchFormErrors>(
    () => validate({ description, species, temperatureTarget, humidityTarget, startAt, finishAt, notes }),
    [description, species, temperatureTarget, humidityTarget, startAt, finishAt, notes],
  );

  /** Sets startAt and, if recipe context is provided, recomputes finishAt. */
  const handleStartAtChange = useCallback((newStart: string, opts?: StartAtChangeOpts) => {
    setStartAt(newStart);
    if (!opts?.recipeId || !opts.recipes) return;
    const recipe = opts.recipes.find((r) => String(r.id) === opts.recipeId);
    if (!recipe) return;
    setFinishAt(computeFinishAt(newStart, recipe.duration_days));
  }, []);

  /** Resets all seven fields to the given values (defaults to empty strings). */
  const resetFields = useCallback((values?: Partial<BatchFormFieldValues>) => {
    setDescription(values?.description ?? '');
    setSpecies(values?.species ?? '');
    setTemperatureTarget(values?.temperatureTarget ?? '');
    setHumidityTarget(values?.humidityTarget ?? '');
    setStartAt(values?.startAt ?? '');
    setFinishAt(values?.finishAt ?? '');
    setNotes(values?.notes ?? '');
  }, []);

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
    setStartAt,
    finishAt,
    setFinishAt,
    notes,
    setNotes,
    errors,
    finishBeforeStartError,
    handleStartAtChange,
    resetFields,
  };
}

import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

import { DateTimeField } from './ui/atoms/DateTimeField';
import { ModalForm } from './ui/molecules/ModalForm';

export interface BatchFormProps {
  // Dialog control
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: () => void;
  canSubmit: boolean;
  isPending: boolean;

  // Shared form fields
  description: string;
  setDescription: (v: string) => void;
  species: string;
  setSpecies: (v: string) => void;
  temperatureTarget: string;
  setTemperatureTarget: (v: string) => void;
  humidityTarget: string;
  setHumidityTarget: (v: string) => void;
  startAt: string;
  onStartAtChange: (v: string) => void;
  /** Validation error shown on the Start field (e.g. active-batch conflict). */
  startAtError?: string | null;
  finishAt: string;
  setFinishAt: (v: string) => void;
  finishBeforeStartError?: string | null;
  notes: string;
  setNotes: (v: string) => void;
  temperatureTargetError?: string;
  humidityTargetError?: string;
  descriptionError?: string;
  notesError?: string;

  /** Rendered above the shared fields (e.g. unit / recipe selects in CreateBatchDialog). */
  topSlot?: ReactNode;
}

export function BatchForm({
  open,
  onClose,
  title,
  submitLabel,
  pendingLabel,
  onSubmit,
  canSubmit,
  isPending,
  description,
  setDescription,
  species,
  setSpecies,
  temperatureTarget,
  setTemperatureTarget,
  humidityTarget,
  setHumidityTarget,
  startAt,
  onStartAtChange,
  startAtError,
  finishAt,
  setFinishAt,
  finishBeforeStartError,
  notes,
  setNotes,
  temperatureTargetError,
  humidityTargetError,
  descriptionError,
  notesError,
  topSlot,
}: BatchFormProps) {
  return (
    <ModalForm
      open={open}
      onClose={onClose}
      title={title}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isPending={isPending}
    >
      {topSlot}
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        placeholder="Optional name or label for this batch"
        error={!!descriptionError}
        helperText={descriptionError ?? undefined}
      />
      <DateTimeField
        label="Start"
        value={startAt ? dayjs(startAt) : null}
        onChange={(v) => onStartAtChange(v ? v.format('YYYY-MM-DDTHH:mm') : '')}
        error={!!startAtError}
        helperText={startAtError ?? undefined}
        sx={{ width: '100%' }}
      />
      <DateTimeField
        label="Finish"
        value={finishAt ? dayjs(finishAt) : null}
        onChange={(v) => setFinishAt(v ? v.format('YYYY-MM-DDTHH:mm') : '')}
        error={!!finishBeforeStartError}
        helperText={finishBeforeStartError ?? undefined}
        sx={{ width: '100%' }}
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
        error={!!temperatureTargetError}
        helperText={temperatureTargetError ?? '0–50 °C'}
        slotProps={{ input: { inputProps: { min: 0, max: 50, step: 0.1 } } }}
      />
      <TextField
        label="Humidity Target (%)"
        type="number"
        value={humidityTarget}
        onChange={(e) => setHumidityTarget(e.target.value)}
        fullWidth
        error={!!humidityTargetError}
        helperText={humidityTargetError ?? '20–90 %'}
        slotProps={{ input: { inputProps: { min: 20, max: 90, step: 0.1 } } }}
      />
      <TextField
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
        multiline
        minRows={3}
        error={!!notesError}
        helperText={notesError ?? undefined}
      />
    </ModalForm>
  );
}

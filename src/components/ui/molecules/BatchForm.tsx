import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { ReactNode } from 'react';

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
  topSlot,
}: BatchFormProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          {topSlot}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Optional name or label for this batch"
          />
          <TextField
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => onStartAtChange(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!startAtError}
            helperText={startAtError ?? undefined}
          />
          <TextField
            label="Finish"
            type="datetime-local"
            value={finishAt}
            onChange={(e) => setFinishAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!finishBeforeStartError}
            helperText={finishBeforeStartError ?? undefined}
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
          />
          <TextField
            label="Humidity Target (%)"
            type="number"
            value={humidityTarget}
            onChange={(e) => setHumidityTarget(e.target.value)}
            fullWidth
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={!canSubmit || isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

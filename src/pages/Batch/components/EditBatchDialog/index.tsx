import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import type { EditBatchDialogProps } from './interfaces';
import { useEditBatchForm } from './useEditBatchForm';

export const EditBatchDialog = ({ open, onClose }: EditBatchDialogProps) => {
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
    setStartAt,
    finishAt,
    setFinishAt,
    notes,
    setNotes,
    canSubmit,
    handleUpdate,
    isPending,
  } = useEditBatchForm({ open, onClose });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Batch</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Optional name or label for this batch"
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
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Finish"
            type="datetime-local"
            value={finishAt}
            onChange={(e) => setFinishAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleUpdate} disabled={!canSubmit || isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

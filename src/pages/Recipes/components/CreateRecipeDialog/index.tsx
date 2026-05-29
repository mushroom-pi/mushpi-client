import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import type { CreateRecipeDialogProps } from './interfaces';
import { useCreateRecipeForm } from './useCreateRecipeForm';

export function CreateRecipeDialog({ open, onClose }: CreateRecipeDialogProps) {
  const { values, errors, isPending, updateField, touchField, resetAndClose, handleSubmit } =
    useCreateRecipeForm({ open, onClose });

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : resetAndClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>New Recipe</DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          id="create-recipe-form"
          spacing={2}
          mt={0.5}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <TextField
            label="Name"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={() => touchField('name')}
            error={!!errors.name}
            helperText={errors.name ?? ' '}
            required
            fullWidth
          />
          <TextField
            label="Species"
            value={values.species}
            onChange={(e) => updateField('species', e.target.value)}
            onBlur={() => touchField('species')}
            error={!!errors.species}
            helperText={errors.species ?? ' '}
            required
            fullWidth
          />
          <TextField
            label="Temperature target (°C)"
            type="number"
            value={values.temperature_target}
            onChange={(e) => updateField('temperature_target', e.target.value)}
            onBlur={() => touchField('temperature_target')}
            error={!!errors.temperature_target}
            helperText={errors.temperature_target ?? '0–50 °C'}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 0, max: 50, step: 0.1 } } }}
          />
          <TextField
            label="Humidity target (%)"
            type="number"
            value={values.humidity_target}
            onChange={(e) => updateField('humidity_target', e.target.value)}
            onBlur={() => touchField('humidity_target')}
            error={!!errors.humidity_target}
            helperText={errors.humidity_target ?? '20–90 %'}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 20, max: 90, step: 0.1 } } }}
          />
          <TextField
            label="Duration (days)"
            type="number"
            value={values.duration_days}
            onChange={(e) => updateField('duration_days', e.target.value)}
            onBlur={() => touchField('duration_days')}
            error={!!errors.duration_days}
            helperText={errors.duration_days ?? 'Minimum 1 day'}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 1, step: 1 } } }}
          />
          <TextField
            label="Notes"
            value={values.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-recipe-form"
          variant="contained"
          disabled={isPending}
        >
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

import type { RecipeFormErrors, RecipeFormValues } from '~hook/RecipeForm/interfaces';

export interface RecipeFormProps {
  // Dialog control
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: () => void;
  canSubmit: boolean;
  isPending: boolean;

  // Form fields
  values: RecipeFormValues;
  errors: RecipeFormErrors;
  updateField: <K extends keyof RecipeFormValues>(field: K, value: RecipeFormValues[K]) => void;
  touchField: (field: keyof RecipeFormValues) => void;
}

export function RecipeForm({
  open,
  onClose,
  title,
  submitLabel,
  pendingLabel,
  onSubmit,
  canSubmit,
  isPending,
  values,
  errors,
  updateField,
  touchField,
}: RecipeFormProps) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack
          component="form"
          id="recipe-form"
          spacing={2}
          mt={0.5}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
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
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="recipe-form"
          variant="contained"
          disabled={!canSubmit || isPending}
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

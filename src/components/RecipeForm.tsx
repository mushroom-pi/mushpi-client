import { TextField } from '@mui/material';

import { schemas } from '~api/generated/schemas';
import { ModalForm } from '~components';
import type { RecipeFormErrors, RecipeFormValues } from '~hook/RecipeForm/interfaces';
import { numericBounds, rangeHint } from '~utils/zodBounds';

// Bounds and hint text derive from the generated Zod schema via numericBounds() — never literal limits.
const temperatureBounds = numericBounds(schemas.CreateRecipeDto.shape.temperature_target);
const humidityBounds = numericBounds(schemas.CreateRecipeDto.shape.humidity_target);
const durationBounds = numericBounds(schemas.CreateRecipeDto.shape.duration_days);

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
    <ModalForm
      open={open}
      onClose={onClose}
      title={title}
      submitLabel={submitLabel}
      pendingLabel={pendingLabel}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isPending={isPending}
      formId="recipe-form"
      blockCloseWhenPending
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
        helperText={errors.temperature_target ?? rangeHint(temperatureBounds, '°C')}
        required
        fullWidth
        slotProps={{
          input: {
            inputProps: { min: temperatureBounds.min, max: temperatureBounds.max, step: 0.1 },
          },
        }}
      />
      <TextField
        label="Humidity target (%)"
        type="number"
        value={values.humidity_target}
        onChange={(e) => updateField('humidity_target', e.target.value)}
        onBlur={() => touchField('humidity_target')}
        error={!!errors.humidity_target}
        helperText={errors.humidity_target ?? rangeHint(humidityBounds, '%')}
        required
        fullWidth
        slotProps={{
          input: { inputProps: { min: humidityBounds.min, max: humidityBounds.max, step: 0.1 } },
        }}
      />
      <TextField
        label="Duration (days)"
        type="number"
        value={values.duration_days}
        onChange={(e) => updateField('duration_days', e.target.value)}
        onBlur={() => touchField('duration_days')}
        error={!!errors.duration_days}
        helperText={errors.duration_days ?? rangeHint(durationBounds, 'day')}
        required
        fullWidth
        slotProps={{
          input: { inputProps: { min: durationBounds.min, max: durationBounds.max, step: 1 } },
        }}
      />
      <TextField
        label="Notes"
        value={values.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        fullWidth
        multiline
        minRows={3}
      />
    </ModalForm>
  );
}

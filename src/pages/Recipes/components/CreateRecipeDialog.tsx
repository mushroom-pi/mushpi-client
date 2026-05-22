import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type { CreateRecipeDto, Recipe } from '~api/generated';
import { recipeKeys } from '~api/queryKeys';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

interface CreateRecipeDialogProps {
  open: boolean;
  onClose: () => void;
}

type FormValues = {
  name: string;
  species: string;
  temperature_target: string;
  humidity_target: string;
  duration_days: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type FormTouched = Partial<Record<keyof FormValues, boolean>>;

const initialValues: FormValues = {
  name: '',
  species: '',
  temperature_target: '',
  humidity_target: '',
  duration_days: '',
  notes: '',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const temp = Number(values.temperature_target);
  const hum = Number(values.humidity_target);
  const dur = Number(values.duration_days);

  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.species.trim()) errors.species = 'Species is required';

  if (!values.temperature_target.trim()) {
    errors.temperature_target = 'Temperature target is required';
  } else if (Number.isNaN(temp) || temp < 0 || temp > 50) {
    errors.temperature_target = 'Must be between 0 and 50 °C';
  }

  if (!values.humidity_target.trim()) {
    errors.humidity_target = 'Humidity target is required';
  } else if (Number.isNaN(hum) || hum < 20 || hum > 90) {
    errors.humidity_target = 'Must be between 20 and 90 %';
  }

  if (!values.duration_days.trim()) {
    errors.duration_days = 'Duration is required';
  } else if (Number.isNaN(dur) || !Number.isInteger(dur) || dur < 1) {
    errors.duration_days = 'Must be a whole number ≥ 1';
  }

  return errors;
}

export function CreateRecipeDialog({ open, onClose }: CreateRecipeDialogProps) {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const mutation = useMutation({
    mutationFn: async (dto: CreateRecipeDto) =>
      unwrap<Recipe>(Recipes.recipesControllerCreate({ createRecipeDto: dto })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      const nextErrors = validate(next);
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  }

  function touchField(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validate(values);
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  }

  function resetAndClose() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Touch all fields to reveal any remaining errors
    const allTouched: FormTouched = Object.fromEntries(
      Object.keys(values).map((k) => [k, true]),
    ) as FormTouched;
    setTouched(allTouched);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const dto: CreateRecipeDto = {
      name: values.name.trim(),
      species: values.species.trim(),
      temperature_target: Number(values.temperature_target),
      humidity_target: Number(values.humidity_target),
      duration_days: Number(values.duration_days),
      notes: values.notes.trim() || undefined,
    };

    await run(() => mutation.mutateAsync(dto), {
      successMessage: 'Recipe created',
      fallbackErrorMessage: 'Failed to create recipe',
      onSuccess: () => resetAndClose(),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? undefined : resetAndClose}
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
          onSubmit={handleSubmit}
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
        <Button onClick={resetAndClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-recipe-form"
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

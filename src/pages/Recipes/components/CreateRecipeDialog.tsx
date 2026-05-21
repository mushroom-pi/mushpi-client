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
import { useMemo, useState } from 'react';

import { unwrap } from '~api/adapter';
import { Recipes } from '~api/client';
import type { CreateRecipeDto, Recipe } from '~api/generated';
import { recipeKeys } from '~api/queryKeys';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

interface CreateRecipeDialogProps {
  open: boolean;
  onClose: () => void;
}

type RecipeFormValues = {
  name: string;
  species: string;
  temperature_target: string;
  humidity_target: string;
  duration_days: string;
  notes: string;
};

type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>;

const initialValues: RecipeFormValues = {
  name: '',
  species: '',
  temperature_target: '',
  humidity_target: '',
  duration_days: '',
  notes: '',
};

function validate(values: RecipeFormValues): RecipeFormErrors {
  const errors: RecipeFormErrors = {};
  const temperature = Number(values.temperature_target);
  const humidity = Number(values.humidity_target);
  const duration = Number(values.duration_days);

  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.species.trim()) errors.species = 'Species is required';
  if (!values.temperature_target.trim()) {
    errors.temperature_target = 'Temperature target is required';
  } else if (Number.isNaN(temperature) || temperature < 0 || temperature > 50) {
    errors.temperature_target = 'Temperature target must be between 0 and 50';
  }

  if (!values.humidity_target.trim()) {
    errors.humidity_target = 'Humidity target is required';
  } else if (Number.isNaN(humidity) || humidity < 20 || humidity > 90) {
    errors.humidity_target = 'Humidity target must be between 20 and 90';
  }

  if (!values.duration_days.trim()) {
    errors.duration_days = 'Duration is required';
  } else if (Number.isNaN(duration) || duration < 1) {
    errors.duration_days = 'Duration must be at least 1 day';
  }

  return errors;
}

export function CreateRecipeDialog({ open, onClose }: CreateRecipeDialogProps) {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();
  const [values, setValues] = useState<RecipeFormValues>(initialValues);
  const [errors, setErrors] = useState<RecipeFormErrors>({});

  const mutation = useMutation({
    mutationFn: async (dto: CreateRecipeDto) => {
      return unwrap<Recipe>(Recipes.recipesControllerCreate({ createRecipeDto: dto }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });

  const hasValidationErrors = useMemo(() => Object.keys(validate(values)).length > 0, [values]);

  function updateField<K extends keyof RecipeFormValues>(field: K, value: RecipeFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function resetAndClose() {
    setValues(initialValues);
    setErrors({});
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
            onChange={(event) => updateField('name', event.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
          />
          <TextField
            label="Species"
            value={values.species}
            onChange={(event) => updateField('species', event.target.value)}
            error={!!errors.species}
            helperText={errors.species}
            required
            fullWidth
          />
          <TextField
            label="Temperature target (°C)"
            type="number"
            value={values.temperature_target}
            onChange={(event) => updateField('temperature_target', event.target.value)}
            error={!!errors.temperature_target}
            helperText={errors.temperature_target}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 0, max: 50, step: 0.1 } } }}
          />
          <TextField
            label="Humidity target (%)"
            type="number"
            value={values.humidity_target}
            onChange={(event) => updateField('humidity_target', event.target.value)}
            error={!!errors.humidity_target}
            helperText={errors.humidity_target}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 20, max: 90, step: 0.1 } } }}
          />
          <TextField
            label="Duration (days)"
            type="number"
            value={values.duration_days}
            onChange={(event) => updateField('duration_days', event.target.value)}
            error={!!errors.duration_days}
            helperText={errors.duration_days}
            required
            fullWidth
            slotProps={{ input: { inputProps: { min: 1, step: 1 } } }}
          />
          <TextField
            label="Notes"
            value={values.notes}
            onChange={(event) => updateField('notes', event.target.value)}
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
          disabled={mutation.isPending || hasValidationErrors}
        >
          {mutation.isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

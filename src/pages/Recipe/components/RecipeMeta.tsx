import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Recipe, UpdateRecipeDto } from '~api/generated';
import { EditableInfoCard, InfoField } from '~components';
import { useRecipeContext } from '~ctx/Recipe';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

type RecipeFormValues = {
  name: string;
  species: string;
  temperature_target: string;
  humidity_target: string;
  duration_days: string;
  notes: string;
};

type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>;
type RecipeFormTouched = Partial<Record<keyof RecipeFormValues, boolean>>;

function formatTimestamp(value: string) {
  return dayjs(value).format('DD MMM YYYY HH:mm');
}

function toFormValues(recipe: Recipe): RecipeFormValues {
  return {
    name: recipe.name,
    species: recipe.species,
    temperature_target: String(recipe.temperature_target),
    humidity_target: String(recipe.humidity_target),
    duration_days: String(recipe.duration_days),
    notes: recipe.notes ?? '',
  };
}

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
    errors.temperature_target = 'Must be between 0 and 50 °C';
  }

  if (!values.humidity_target.trim()) {
    errors.humidity_target = 'Humidity target is required';
  } else if (Number.isNaN(humidity) || humidity < 20 || humidity > 90) {
    errors.humidity_target = 'Must be between 20 and 90 %';
  }

  if (!values.duration_days.trim()) {
    errors.duration_days = 'Duration is required';
  } else if (Number.isNaN(duration) || !Number.isInteger(duration) || duration < 1) {
    errors.duration_days = 'Must be a whole number ≥ 1';
  }

  return errors;
}

export function RecipeMeta() {
  const navigate = useNavigate();
  const { run } = useAsyncWithToast();
  const { recipe, updateRecipe, deleteRecipe } = useRecipeContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [values, setValues] = useState<RecipeFormValues | null>(null);
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [touched, setTouched] = useState<RecipeFormTouched>({});

  const initialValues = useMemo(() => (recipe ? toFormValues(recipe) : null), [recipe]);
  const hasChanges = useMemo(() => {
    if (!initialValues || !values) return false;
    return Object.entries(values).some(
      ([key, value]) => value !== initialValues[key as keyof RecipeFormValues],
    );
  }, [initialValues, values]);

  useEffect(() => {
    if (!editOpen || !recipe) return;
    setValues(toFormValues(recipe));
    setErrors({});
    setTouched({});
  }, [editOpen, recipe]);

  if (!recipe) return null;

  const recipeId = recipe.id;

  function updateField<K extends keyof RecipeFormValues>(field: K, value: RecipeFormValues[K]) {
    setValues((current) => (current ? { ...current, [field]: value } : current));
    // Re-validate only touched fields on change
    setErrors((current) => {
      if (!touched[field]) return current;
      const next = values ? validate({ ...values, [field]: value }) : {};
      return { ...current, [field]: next[field] };
    });
  }

  function touchField(field: keyof RecipeFormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (!values) return;
    const next = validate(values);
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  function closeEditDialog() {
    setEditOpen(false);
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values) return;

    // Touch all fields to show any remaining errors
    const allTouched: RecipeFormTouched = Object.fromEntries(
      Object.keys(values).map((k) => [k, true]),
    ) as RecipeFormTouched;
    setTouched(allTouched);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body: UpdateRecipeDto = {
      name: values.name.trim(),
      species: values.species.trim(),
      temperature_target: Number(values.temperature_target),
      humidity_target: Number(values.humidity_target),
      duration_days: Number(values.duration_days),
      notes: values.notes.trim() || undefined,
    };

    await run(() => updateRecipe.mutateAsync({ recipeId, body }), {
      successMessage: 'Recipe updated',
      fallbackErrorMessage: 'Failed to update recipe',
      onSuccess: () => closeEditDialog(),
    });
  }

  async function handleDelete() {
    await run(() => deleteRecipe.mutateAsync(recipeId), {
      successMessage: 'Recipe deleted',
      fallbackErrorMessage: 'Failed to delete recipe',
      onSuccess: () => {
        setDeleteOpen(false);
        navigate('/recipes');
      },
    });
  }

  return (
    <>
      <EditableInfoCard
        title="Recipe details"
        subtitle={`Updated ${formatTimestamp(recipe.updated_at)}`}
        onClickEdit={() => setEditOpen(true)}
        headerActions={
          <Tooltip title="Delete recipe">
            <IconButton
              aria-label="delete recipe"
              color="error"
              size="small"
              onClick={() => setDeleteOpen(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        <InfoField label="Name">
          <Typography>{recipe.name}</Typography>
        </InfoField>
        <InfoField label="Species">
          <Typography>{recipe.species}</Typography>
        </InfoField>
        <InfoField label="Temperature target">
          <Typography>{recipe.temperature_target} °C</Typography>
        </InfoField>
        <InfoField label="Humidity target">
          <Typography>{recipe.humidity_target}%</Typography>
        </InfoField>
        <InfoField label="Duration">
          <Typography>{recipe.duration_days} days</Typography>
        </InfoField>
        <InfoField label="Notes">
          <Typography>{recipe.notes || '—'}</Typography>
        </InfoField>
        <InfoField label="Created">
          <Typography>{formatTimestamp(recipe.created_at)}</Typography>
        </InfoField>
      </EditableInfoCard>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={updateRecipe.isLoading ? undefined : closeEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Recipe</DialogTitle>
        <DialogContent dividers>
          <Stack component="form" id="edit-recipe-form" spacing={2} mt={0.5} onSubmit={handleSave}>
            <TextField
              label="Name"
              value={values?.name ?? ''}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => touchField('name')}
              error={!!errors.name}
              helperText={errors.name ?? ' '}
              required
              fullWidth
            />
            <TextField
              label="Species"
              value={values?.species ?? ''}
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
              value={values?.temperature_target ?? ''}
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
              value={values?.humidity_target ?? ''}
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
              value={values?.duration_days ?? ''}
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
              value={values?.notes ?? ''}
              onChange={(e) => updateField('notes', e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={updateRecipe.isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-recipe-form"
            variant="contained"
            disabled={updateRecipe.isLoading || !hasChanges}
          >
            {updateRecipe.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onClose={deleteRecipe.isLoading ? undefined : () => setDeleteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Delete recipe</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Deleting <strong>{recipe.name}</strong> is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteRecipe.isLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteRecipe.isLoading}
          >
            {deleteRecipe.isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

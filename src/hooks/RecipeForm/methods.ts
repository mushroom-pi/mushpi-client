import type { Recipe } from '~api/generated';

import type { RecipeFormErrors, RecipeFormValues } from './interfaces';

export const initialValues: RecipeFormValues = {
  name: '',
  species: '',
  temperature_target: '',
  humidity_target: '',
  duration_days: '',
  notes: '',
};

export function toFormValues(recipe: Recipe): RecipeFormValues {
  return {
    name: recipe.name,
    species: recipe.species,
    temperature_target: String(recipe.temperature_target),
    humidity_target: String(recipe.humidity_target),
    duration_days: String(recipe.duration_days),
    notes: recipe.notes ?? '',
  };
}

export function validate(values: RecipeFormValues): RecipeFormErrors {
  const errors: RecipeFormErrors = {};
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

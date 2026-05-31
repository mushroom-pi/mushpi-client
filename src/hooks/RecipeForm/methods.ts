import type { Recipe } from '~api/generated';
import { schemas } from '~api/generated/schemas';

import type { RecipeFormErrors, RecipeFormValues } from './interfaces';

/** Convert string form values to the types CreateRecipeDto expects.
 *  Empty numeric fields become undefined so the schema reports "required". */
function toDto(values: RecipeFormValues) {
  const num = (v: string) => (v.trim() ? Number(v) : undefined);
  return {
    name: values.name.trim(),
    species: values.species.trim(),
    temperature_target: num(values.temperature_target),
    humidity_target: num(values.humidity_target),
    duration_days: num(values.duration_days),
    notes: values.notes.trim() || undefined,
  };
}

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
  const result = schemas.CreateRecipeDto.safeParse(toDto(values));

  const errors: RecipeFormErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RecipeFormValues | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
  }

  // The spec omits .int() on duration_days, but the UI requires whole days.
  const dur = toDto(values).duration_days;
  if (!errors.duration_days && dur !== undefined && !Number.isInteger(dur)) {
    errors.duration_days = 'Must be a whole number';
  }

  return errors;
}

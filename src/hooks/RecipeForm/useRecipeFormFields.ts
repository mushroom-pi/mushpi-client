import { useCallback, useState } from 'react';

import type { RecipeFormErrors, RecipeFormTouched, RecipeFormValues } from './interfaces';
import { initialValues, validate } from './methods';

/**
 * Shared form-field state for both CreateRecipeDialog and EditRecipeDialog.
 * Provides the 6 editable fields, blur-based validation, touchAll (for submit),
 * and resetFields.
 */
export function useRecipeFormFields(initial: RecipeFormValues = initialValues) {
  const [values, setValues] = useState<RecipeFormValues>(initial);
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const [touched, setTouched] = useState<RecipeFormTouched>({});

  function updateField<K extends keyof RecipeFormValues>(field: K, value: RecipeFormValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      const nextErrors = validate(next);
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  }

  function touchField(field: keyof RecipeFormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validate(values);
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  }

  /** Touches all fields and reveals all errors. Returns true if the form is valid. */
  function touchAll(): boolean {
    const allTouched = Object.fromEntries(
      Object.keys(initialValues).map((k) => [k, true]),
    ) as RecipeFormTouched;
    setTouched(allTouched);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  /** Resets all fields, errors, and touched state. Defaults to empty initialValues. */
  const resetFields = useCallback((newValues: RecipeFormValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, []);

  return { values, errors, updateField, touchField, touchAll, resetFields };
}

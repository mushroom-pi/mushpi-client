import { useEffect, useMemo } from 'react';

import type { UpdateRecipeDto } from '~api/generated';
import { useRecipeContext } from '~ctx/Recipe';
import type { RecipeFormValues } from '~hook/RecipeForm/interfaces';
import { toFormValues } from '~hook/RecipeForm/methods';
import { useRecipeFormFields } from '~hook/RecipeForm/useRecipeFormFields';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

import type { EditRecipeDialogProps } from './interfaces';

export function useEditRecipeForm({ open, onClose }: EditRecipeDialogProps) {
  const { run } = useAsyncWithToast();
  const { recipe, updateRecipe } = useRecipeContext();
  const { values, errors, updateField, touchField, touchAll, resetFields } = useRecipeFormFields();

  const initialFormValues = useMemo(() => (recipe ? toFormValues(recipe) : null), [recipe]);

  const hasChanges = useMemo(() => {
    if (!initialFormValues) return false;
    return Object.entries(values).some(
      ([key, value]) => value !== initialFormValues[key as keyof RecipeFormValues],
    );
  }, [initialFormValues, values]);

  useEffect(() => {
    if (!open || !recipe) return;
    resetFields(toFormValues(recipe));
  }, [open, recipe, resetFields]);

  function closeDialog() {
    resetFields(initialFormValues ?? undefined);
    onClose();
  }

  async function handleSave() {
    if (!recipe || !touchAll()) return;

    const body: UpdateRecipeDto = {
      name: values.name.trim(),
      species: values.species.trim(),
      temperature_target: Number(values.temperature_target),
      humidity_target: Number(values.humidity_target),
      duration_days: Number(values.duration_days),
      notes: values.notes.trim() || undefined,
    };

    await run(() => updateRecipe.mutateAsync({ recipeId: recipe.id, body }), {
      successMessage: 'Recipe updated',
      fallbackErrorMessage: 'Failed to update recipe',
      onSuccess: () => closeDialog(),
    });
  }

  return {
    values,
    errors,
    hasChanges,
    isValid: !Object.values(errors).some(Boolean),
    isPending: updateRecipe.isLoading,
    updateField,
    touchField,
    closeDialog,
    handleSave,
  };
}

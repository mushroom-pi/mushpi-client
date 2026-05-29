import { useQueryClient } from '@tanstack/react-query';

import type { CreateRecipeDto } from '~api/generated';
import { createRecipeMutation } from '~ctx/Recipe';
import { useRecipeFormFields } from '~hook/RecipeForm/useRecipeFormFields';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

import type { CreateRecipeDialogProps } from './interfaces';

export function useCreateRecipeForm({ onClose }: CreateRecipeDialogProps) {
  const queryClient = useQueryClient();
  const { run } = useAsyncWithToast();
  const { values, errors, updateField, touchField, touchAll, resetFields } = useRecipeFormFields();

  const mutation = createRecipeMutation(queryClient);

  function resetAndClose() {
    resetFields();
    onClose();
  }

  async function handleSubmit() {
    if (!touchAll()) return;

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

  return {
    values,
    errors,
    isPending: mutation.isPending,
    updateField,
    touchField,
    resetAndClose,
    handleSubmit,
  };
}

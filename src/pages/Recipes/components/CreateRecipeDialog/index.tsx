import { RecipeForm } from '~components';

import type { CreateRecipeDialogProps } from './interfaces';
import { useCreateRecipeForm } from './useCreateRecipeForm';

export function CreateRecipeDialog({ open, onClose }: CreateRecipeDialogProps) {
  const { values, errors, isValid, isPending, updateField, touchField, resetAndClose, handleSubmit } =
    useCreateRecipeForm({ open, onClose });

  return (
    <RecipeForm
      open={open}
      onClose={resetAndClose}
      title="New Recipe"
      submitLabel="Create"
      pendingLabel="Creating…"
      onSubmit={handleSubmit}
      canSubmit={isValid}
      isPending={isPending}
      values={values}
      errors={errors}
      updateField={updateField}
      touchField={touchField}
    />
  );
}

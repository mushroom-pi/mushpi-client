import { RecipeForm } from '~components';

import type { EditRecipeDialogProps } from './interfaces';
import { useEditRecipeForm } from './useEditRecipeForm';

export function EditRecipeDialog({ open, onClose }: EditRecipeDialogProps) {
  const { values, errors, hasChanges, isPending, updateField, touchField, closeDialog, handleSave } =
    useEditRecipeForm({ open, onClose });

  return (
    <RecipeForm
      open={open}
      onClose={closeDialog}
      title="Edit Recipe"
      submitLabel="Save"
      pendingLabel="Saving…"
      onSubmit={handleSave}
      canSubmit={hasChanges}
      isPending={isPending}
      values={values}
      errors={errors}
      updateField={updateField}
      touchField={touchField}
    />
  );
}

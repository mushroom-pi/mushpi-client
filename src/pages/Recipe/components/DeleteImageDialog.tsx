import { Alert, DialogContentText } from '@mui/material';

import { ConfirmDialog } from '~components';
import { useRecipeContext } from '~ctx/Recipe';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface DeleteImageDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteImageDialog({ open, onClose }: DeleteImageDialogProps) {
  const { run } = useAsyncWithToast();
  const { recipe, deleteImage } = useRecipeContext();

  async function handleDelete() {
    if (!recipe) return;
    await run(() => deleteImage.mutateAsync(recipe.id), {
      successMessage: 'Image removed',
      fallbackErrorMessage: 'Failed to remove image',
      onSuccess: () => onClose(),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Remove Recipe Image"
      confirmLabel="Remove image"
      danger
      isLoading={deleteImage.isLoading}
      onConfirm={handleDelete}
    >
      <DialogContentText>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          Are you sure you want to remove the image from <strong>{recipe?.name}</strong>? This
          action cannot be undone.
        </Alert>
      </DialogContentText>
    </ConfirmDialog>
  );
}

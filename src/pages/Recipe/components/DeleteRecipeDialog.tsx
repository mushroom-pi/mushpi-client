import { Alert, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '~components';
import { useRecipeContext } from '~ctx/Recipe';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface DeleteRecipeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteRecipeDialog({ open, onClose }: DeleteRecipeDialogProps) {
  const navigate = useNavigate();
  const { run } = useAsyncWithToast();
  const { recipe, deleteRecipe } = useRecipeContext();

  async function handleDelete() {
    if (!recipe) return;
    await run(() => deleteRecipe.mutateAsync(recipe.id), {
      successMessage: 'Recipe deleted',
      fallbackErrorMessage: 'Failed to delete recipe',
      onSuccess: () => {
        onClose();
        navigate('/recipes');
      },
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete Recipe"
      confirmLabel="Delete permanently"
      danger
      isLoading={deleteRecipe.isLoading}
      onConfirm={handleDelete}
    >
      <DialogContentText>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          Deleting this recipe is permanent and cannot be undone. Please confirm that you want to
          permanently delete <strong>{recipe?.name}</strong>.
        </Alert>
      </DialogContentText>
    </ConfirmDialog>
  );
}

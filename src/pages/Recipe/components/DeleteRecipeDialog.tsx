import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
    <Dialog
      open={open}
      onClose={deleteRecipe.isLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Delete recipe</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Deleting <strong>{recipe?.name}</strong> is permanent and cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteRecipe.isLoading}>
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
  );
}

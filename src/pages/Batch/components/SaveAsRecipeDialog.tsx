import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useBatchContext } from '~ctx/Batch';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface SaveAsRecipeDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SaveAsRecipeDialog = ({ open, onClose }: SaveAsRecipeDialogProps) => {
  const { run } = useAsyncWithToast();
  const { batch, createRecipeFromBatch } = useBatchContext();

  const [recipeName, setRecipeName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');

  useEffect(() => {
    if (!open || !batch) return;
    setRecipeName(batch.recipe?.name ?? batch.species?.trim() ?? `Batch ${batch.id}`);
    setRecipeNotes(batch.notes ?? '');
  }, [batch, open]);

  const handleSaveRecipe = async () => {
    if (!batch) return;
    await run(
      () =>
        createRecipeFromBatch.mutateAsync({
          batchId: batch.id,
          name: recipeName.trim(),
          notes: recipeNotes.trim() || undefined,
        }),
      {
        successMessage: 'Recipe saved from batch',
        fallbackErrorMessage: 'Failed to save recipe from batch',
        onSuccess: () => onClose(),
      },
    );
  };

  const hasRecipeName = recipeName.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Save Batch as Recipe</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
          <TextField
            label="Name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Notes"
            value={recipeNotes}
            onChange={(e) => setRecipeNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createRecipeFromBatch.isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveRecipe}
          disabled={!hasRecipeName || createRecipeFromBatch.isLoading}
        >
          {createRecipeFromBatch.isLoading ? 'Saving…' : 'Save Recipe'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

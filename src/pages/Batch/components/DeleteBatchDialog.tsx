import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useBatchContext } from '~ctx/Batch';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

export interface DeleteBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteBatchDialog = ({ open, onClose, onSuccess }: DeleteBatchDialogProps) => {
  const { run } = useAsyncWithToast();
  const { batch, deleteBatch } = useBatchContext();

  const handleDelete = async () => {
    if (!batch) return;
    await run(() => deleteBatch.mutateAsync(batch.id), {
      successMessage: 'Batch deleted successfully',
      fallbackErrorMessage: 'Failed to delete batch',
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete Batch</DialogTitle>
      <DialogContent dividers>
        <DialogContentText component="div">
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action permanently deletes batch #{batch?.id}. This cannot be undone.
          </Alert>
          Are you sure you want to delete this batch?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteBatch.isLoading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={deleteBatch.isLoading}
        >
          {deleteBatch.isLoading ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

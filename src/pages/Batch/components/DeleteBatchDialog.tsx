import { Alert, DialogContentText } from '@mui/material';

import { ConfirmDialog } from '~components';
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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete Batch"
      confirmLabel="Delete permanently"
      danger
      isLoading={deleteBatch.isLoading}
      onConfirm={handleDelete}
    >
      <DialogContentText>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          Deleting this batch is permanent and cannot be undone. All associated readings will be
          removed. Please confirm that you want to permanently delete batch{' '}
          <strong>#{batch?.id}</strong>.
        </Alert>
      </DialogContentText>
    </ConfirmDialog>
  );
};

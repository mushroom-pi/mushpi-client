import { Alert, DialogContentText } from '@mui/material';

import { useAsyncWithToast } from '~hook/useAsyncWithToast';

import { ConfirmDialog } from '../ConfirmDialog';

export interface RemoveImageDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  entityName: string;
  imageLabel?: string;
}

export function RemoveImageDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  entityName,
  imageLabel,
}: RemoveImageDialogProps) {
  const { run } = useAsyncWithToast();

  async function handleConfirm() {
    await run(() => onConfirm(), {
      successMessage: `${entityName} image removed`,
      fallbackErrorMessage: `Failed to remove ${entityName.toLowerCase()} image`,
      onSuccess: () => onClose(),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={`Remove ${entityName} Image`}
      confirmLabel="Remove image"
      danger
      isLoading={isLoading}
      onConfirm={handleConfirm}
    >
      <DialogContentText>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          Are you sure you want to remove{' '}
          {imageLabel ? (
            <>
              the image <strong>{imageLabel}</strong>
            </>
          ) : (
            'this image'
          )}{' '}
          from this {entityName.toLowerCase()}? This action cannot be undone.
        </Alert>
      </DialogContentText>
    </ConfirmDialog>
  );
}

import { Alert, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import type { DialogProps } from '~int/dialogProps';

export const DeletePicoUnit: React.FC<DialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { run } = useAsyncWithToast();
  const { pico, deletePico } = usePicoUnitContext();

  if (!pico) return null;

  async function doDeletePico() {
    if (!pico) return;
    await run(async () => {
      await deletePico.mutateAsync(pico.id);
      navigate(-1);
    }, {
      successMessage: 'Pico unit deleted permanently',
      fallbackErrorMessage: 'Failed to remove pico unit',
      onSuccess: () => onClose(),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete Pico Unit"
      confirmLabel="Delete permanently"
      danger
      isLoading={deletePico.isLoading}
      onConfirm={doDeletePico}
    >
      <DialogContentText>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          Deleting this pico unit is permanent and cannot be undone. All associated readings and
          configuration will be removed. Please confirm that you want to permanently delete{' '}
          <strong>{pico.name}</strong>.
        </Alert>
      </DialogContentText>
    </ConfirmDialog>
  );
};

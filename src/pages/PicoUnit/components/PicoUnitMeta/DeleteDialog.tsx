import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { HeaderAndIcon } from '~comp/HeaderAndIcon';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import type { DialogProps } from '~int/dialogProps';

export const DeleteDialog: React.FC<DialogProps> = ({ open, onClose, closeOnSave = true }) => {
  const navigate = useNavigate();
  const { run } = useAsyncWithToast();
  const { pico, deletePico } = usePicoUnitContext();

  if (!pico) return;

  async function doDeletePico() {
    if (!pico) return;

    await run(() => Promise.all([deletePico.mutateAsync(pico.id), navigate(-1)]), {
      successMessage: 'Pico unit deleted permanently',
      fallbackErrorMessage: 'Failed to remove pico unit',
      onSuccess: () => {
        if (closeOnSave) onClose();
      },
    });
  }

  const isDeleting = deletePico.isLoading;

  return (
    open && (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle display="flex" alignItems="center" justifyContent="space-between">
          <HeaderAndIcon title="Delete Pico Unit" icon={<RemoveIcon />} />
        </DialogTitle>

        <DialogContent dividers>
          <DialogContentText>
            <Alert severity="warning" variant="filled" sx={{ m: 1, borderRadius: 2 }}>
              Deleting this pico unit is permanent and cannot be undone. All associated readings and
              configuration will be removed. Please confirm that you want to permanently delete{' '}
              <strong>{pico.name}</strong>.
            </Alert>
          </DialogContentText>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={doDeletePico}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  );
};

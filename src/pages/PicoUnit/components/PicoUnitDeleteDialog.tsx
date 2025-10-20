import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { PicoUnit } from '~api/generated';
import { usePicoUnitContext } from '~ctx/PicoUnit';

interface PicoUnitDeleteDialogProps {
  deleteOpen: boolean;
  setDeleteOpen: (input: boolean) => void;
  pico: PicoUnit;
}

export const PicoUnitDeleteDialog: React.FC<PicoUnitDeleteDialogProps> = ({
  deleteOpen,
  setDeleteOpen,
  pico,
}) => {
  const navigate = useNavigate();
  const { deletePico } = usePicoUnitContext();

  async function doDeletePico() {
    if (!pico) return;
    try {
      // mutateAsync will throw on error — provider handles optimistic removal and rollback
      await deletePico.mutateAsync(pico.id);
      // after successful delete, navigate back (or to a safe route)
      navigate(-1);
    } catch (err) {
      // optional: show toast / console error
      console.error('Failed to delete pico unit', err);
    } finally {
      setDeleteOpen(false);
    }
  }

  const isDeleting = deletePico.isLoading;

  return (
    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
      <DialogTitle>Delete Pico Unit</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting this pico unit is permanent and cannot be undone. All associated readings and
          configuration will be removed. Please confirm that you want to permanently delete{' '}
          <strong>{pico.name}</strong>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
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
  );
};

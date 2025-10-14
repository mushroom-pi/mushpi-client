import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { PicoUnit } from '../../../api/generated';
import { useDeletePicoUnit } from '../../../hooks/usePicoUnits';

interface PicoUnitDeleteDialogProps {
  deleteOpen: boolean;
  setDeleteOpen: (input: boolean) => void;
  pico: PicoUnit;
}

export const PicoUnitDeleteDialog: React.FC<PicoUnitDeleteDialogProps> = ({
  deleteOpen,
  setDeleteOpen,
  pico,
}: PicoUnitDeleteDialogProps) => {
  const navigate = useNavigate();
  const deleteMutation = useDeletePicoUnit();
  const [deleting, setDeleting] = useState(false);

  async function doDeletePico() {
    if (!pico) return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync(pico.id);
      // after delete, navigate back to the list
      navigate(-1);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }
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
        <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={doDeletePico}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

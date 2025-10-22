import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';

import { usePicoUnitContext } from '~ctx/PicoUnit';

interface ModalDialogProps {
  open: boolean;
  hasChanges?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  doSaveChanges: () => void;
  handleCancel: () => void;
  children: React.ReactNode;
  headerAndIcon: React.ReactElement;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  children,
  doSaveChanges,
  handleCancel,
  hasChanges = false,
  isSaving,
  headerAndIcon,
}) => {
  const { pico } = usePicoUnitContext();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="pico-edit-dialog-title"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle display="flex" alignItems="center" justifyContent="space-between">
        {headerAndIcon}
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!pico ? (
          <Box py={2}>
            <Typography variant="body2">No pico selected</Typography>
          </Box>
        ) : (
          <>{children}</>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={doSaveChanges}
          disabled={isSaving || !hasChanges || !pico}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

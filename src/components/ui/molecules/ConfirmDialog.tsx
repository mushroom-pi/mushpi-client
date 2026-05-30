import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Label for the confirm button. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Disables both buttons and blocks backdrop close while true. */
  isLoading?: boolean;
  onConfirm: () => void;
  /** Renders the confirm button as error/contained. */
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  isLoading = false,
  onConfirm,
  danger = false,
}) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers>{children}</DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        color={danger ? 'error' : 'primary'}
        variant="contained"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

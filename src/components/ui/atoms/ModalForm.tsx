import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import type { Breakpoint } from '@mui/material';
import type { ReactNode } from 'react';

export interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: () => void;
  canSubmit: boolean;
  isPending: boolean;
  children: ReactNode;
  /**
   * If provided, the content Stack becomes a <form> element with this id,
   * enabling Enter-key submission. The submit button will use type="submit".
   */
  formId?: string;
  /** Prevent closing the dialog while a submission is in progress. */
  blockCloseWhenPending?: boolean;
  maxWidth?: Breakpoint;
}

export function ModalForm({
  open,
  onClose,
  title,
  submitLabel,
  pendingLabel,
  onSubmit,
  canSubmit,
  isPending,
  children,
  formId,
  blockCloseWhenPending = false,
  maxWidth = 'sm',
}: ModalFormProps) {
  const effectiveOnClose = blockCloseWhenPending && isPending ? undefined : onClose;

  return (
    <Dialog open={open} onClose={effectiveOnClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack
          component={formId ? 'form' : 'div'}
          id={formId}
          spacing={2}
          mt={0.5}
          {...(formId && {
            onSubmit: (e: React.FormEvent) => {
              e.preventDefault();
              onSubmit();
            },
          })}
        >
          {children}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          {...(formId ? { type: 'submit' as const, form: formId } : { onClick: onSubmit })}
          variant="contained"
          disabled={!canSubmit || isPending}
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

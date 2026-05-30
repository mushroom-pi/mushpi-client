import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { ModalForm } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';

export interface PicoUnitFormProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSubmit: () => void;
  canSubmit?: boolean;
  isPending?: boolean;
  children: ReactNode;
}

export function PicoUnitForm({
  open,
  onClose,
  title,
  onSubmit,
  canSubmit = false,
  isPending = false,
  children,
}: PicoUnitFormProps) {
  const { pico } = usePicoUnitContext();

  return (
    <ModalForm
      open={open}
      onClose={onClose}
      title={title}
      submitLabel="Save"
      pendingLabel="Saving…"
      onSubmit={onSubmit}
      canSubmit={canSubmit && !!pico}
      isPending={isPending}
    >
      {!pico ? (
        <Box py={2}>
          <Typography variant="body2">No pico selected</Typography>
        </Box>
      ) : (
        children
      )}
    </ModalForm>
  );
}

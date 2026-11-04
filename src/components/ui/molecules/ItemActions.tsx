import { Stack } from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

import { DeleteButton, EditButton } from '~components';

export interface ItemActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  /** Optional action(s) rendered before the Edit/Delete pair (e.g. Save as Recipe). */
  leading?: ReactNode;
}

/**
 * One-row Edit/Delete action pair for detail pages.
 * The row wraps as a whole (leading actions may drop below) while the
 * Edit/Delete pair stays atomic and never splits between the two buttons.
 */
export const ItemActions: React.FC<ItemActionsProps> = ({ onEdit, onDelete, leading }) => (
  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
    {leading}
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <EditButton onClick={onEdit} />
      <DeleteButton onClick={onDelete} />
    </Stack>
  </Stack>
);

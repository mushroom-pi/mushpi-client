import { Chip } from '@mui/material';

import type { BatchStatusEnum } from '~api/generated';

const STATUS_LABEL: Record<BatchStatusEnum, string> = {
  planned: 'Planned',
  'in-progress': 'In progress',
  finished: 'Finished',
};

const STATUS_COLOR: Record<BatchStatusEnum, 'info' | 'warning' | 'success'> = {
  planned: 'info',
  'in-progress': 'warning',
  finished: 'success',
};

export const StatusChip = ({ status }: { status: BatchStatusEnum }) => (
  <Chip
    label={STATUS_LABEL[status] ?? status}
    color={STATUS_COLOR[status] ?? 'default'}
    size="small"
  />
);

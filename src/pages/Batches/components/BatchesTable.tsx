import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';

import type { Batch, BatchStatusEnum } from '~api/generated';
import { ReadableTime } from '~components';
import { StatusChip } from '~pages/Batches/components/StatusChip';

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY HH:mm');
};

const DateTimeCell = ({ value, status }: { value?: string | null; status: BatchStatusEnum }) => {
  if (!value) {
    return (
      <Typography variant="body2" color="text.secondary">
        {status === 'planned' ? 'Planned' : 'In progress'}
      </Typography>
    );
  }

  const secondsAgo = Math.max(dayjs().diff(dayjs(value), 'second'), 0);

  return (
    <Stack spacing={0.25}>
      <Typography variant="body2">{formatDateTime(value)}</Typography>
      <Typography variant="caption" color="text.secondary" component="span">
        <ReadableTime seconds={secondsAgo} compact variant="caption" /> ago
      </Typography>
    </Stack>
  );
};

interface BatchesTableProps {
  batches: Batch[];
  onRowClick: (id: number) => void;
  hideUnitColumn?: boolean;
  activeId?: number;
  disablePaper?: boolean;
}

export const BatchesTable = ({
  batches,
  onRowClick,
  hideUnitColumn,
  activeId,
  disablePaper,
}: BatchesTableProps) => {
  const columnCount = hideUnitColumn ? 6 : 7;

  return (
    <TableContainer component={disablePaper ? 'div' : Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {!hideUnitColumn && <TableCell>Unit</TableCell>}
            <TableCell>Description</TableCell>
            <TableCell>Species</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>Finish</TableCell>
            <TableCell>Recipe</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {batches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <Typography variant="body2" color="text.secondary">
                  No batches found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            batches.map((batch) => (
              <TableRow
                key={batch.id}
                hover
                onClick={() => onRowClick(batch.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: activeId === batch.id ? 'action.selected' : undefined,
                }}
              >
                {!hideUnitColumn && (
                  <TableCell>{batch.pico_unit.name ?? batch.pico_unit.handle}</TableCell>
                )}
                <TableCell>{batch.description ?? '—'}</TableCell>
                <TableCell>{batch.species ?? '—'}</TableCell>
                <TableCell>
                  <DateTimeCell value={batch.start_at} status={batch.status} />
                </TableCell>
                <TableCell>
                  <DateTimeCell value={batch.finish_at} status={batch.status} />
                </TableCell>
                <TableCell>{batch.recipe?.name ?? '—'}</TableCell>
                <TableCell>
                  <StatusChip status={batch.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

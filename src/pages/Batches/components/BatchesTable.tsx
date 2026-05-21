import {
  Chip,
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

import type { Batch } from '~api/generated';
import { ReadableTime } from '~components';

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY HH:mm');
};

const StatusChip = ({ finishAt }: { finishAt?: string | null }) => {
  const isFinished = Boolean(finishAt);

  return (
    <Chip
      label={isFinished ? 'Finished' : 'In progress'}
      color={isFinished ? 'success' : 'warning'}
      size="small"
    />
  );
};

const DateTimeCell = ({ value }: { value?: string | null }) => {
  if (!value) {
    return <Typography variant="body2">In progress</Typography>;
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
}

export const BatchesTable = ({ batches, onRowClick }: BatchesTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Unit</TableCell>
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
              <TableCell colSpan={6}>
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
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{batch.pico_unit.name ?? batch.pico_unit.handle}</TableCell>
                <TableCell>{batch.species ?? '—'}</TableCell>
                <TableCell>
                  <DateTimeCell value={batch.start_at} />
                </TableCell>
                <TableCell>
                  <DateTimeCell value={batch.finish_at} />
                </TableCell>
                <TableCell>{batch.recipe?.name ?? '—'}</TableCell>
                <TableCell>
                  <StatusChip finishAt={batch.finish_at} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

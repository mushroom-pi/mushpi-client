import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Batch, BatchStatusEnum } from '~api/generated';
import type { DataTableColumn } from '~components';
import { DataTable } from '~components';
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
  onRowClick?: (id: number) => void;
  hideUnitColumn?: boolean;
  hideSpeciesColumn?: boolean;
  hideRecipeColumn?: boolean;
  activeId?: number;
  disablePaper?: boolean;
}

export const BatchesTable = ({
  batches,
  onRowClick,
  hideUnitColumn,
  hideSpeciesColumn,
  hideRecipeColumn,
  activeId,
  disablePaper,
}: BatchesTableProps) => {
  const navigate = useNavigate();

  const columns = useMemo<DataTableColumn<Batch>[]>(
    () => [
      {
        key: 'unit',
        label: 'Unit',
        hidden: hideUnitColumn,
        sortValue: (b) => b.pico_unit.name ?? b.pico_unit.handle,
        renderCell: (b) => b.pico_unit.name ?? b.pico_unit.handle,
      },
      {
        key: 'description',
        label: 'Description',
        sortValue: (b) => b.description ?? '',
        renderCell: (b) => b.description ?? '—',
      },
      {
        key: 'species',
        label: 'Species',
        hidden: hideSpeciesColumn,
        sortValue: (b) => b.species ?? '',
        renderCell: (b) => b.species ?? '—',
      },
      {
        key: 'start_at',
        label: 'Start',
        sortValue: (b) => b.start_at ?? '',
        renderCell: (b) => <DateTimeCell value={b.start_at} status={b.status} />,
      },
      {
        key: 'finish_at',
        label: 'Finish',
        sortValue: (b) => b.finish_at ?? '',
        renderCell: (b) => <DateTimeCell value={b.finish_at} status={b.status} />,
      },
      {
        key: 'recipe',
        label: 'Recipe',
        hidden: hideRecipeColumn,
        sortValue: (b) => b.recipe?.name ?? '',
        renderCell: (b) => b.recipe?.name ?? '—',
      },
      {
        key: 'status',
        label: 'Status',
        sortValue: (b) => b.status,
        renderCell: (b) => <StatusChip status={b.status} />,
      },
    ],
    [hideUnitColumn, hideSpeciesColumn, hideRecipeColumn],
  );

  return (
    <DataTable
      columns={columns}
      rows={batches}
      onRowClick={onRowClick ?? ((id) => navigate(`/batches/${id}`))}
      activeId={activeId}
      disablePaper={disablePaper}
      emptyMessage="No batches found."
    />
  );
};

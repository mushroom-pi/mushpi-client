import dayjs from 'dayjs';

import type { Recipe } from '~api/generated';
import { DataTable } from '~components';
import type { DataTableColumn } from '~components';

function formatDate(iso: string) {
  return dayjs(iso).format('DD MMM YYYY HH:mm');
}

const columns: DataTableColumn<Recipe>[] = [
  {
    key: 'name',
    label: 'Name',
    sortValue: (r) => r.name,
    renderCell: (r) => r.name,
  },
  {
    key: 'species',
    label: 'Species',
    sortValue: (r) => r.species,
    renderCell: (r) => r.species,
  },
  {
    key: 'temperature_target',
    label: 'Temp (°C)',
    sortValue: (r) => r.temperature_target,
    renderCell: (r) => r.temperature_target,
  },
  {
    key: 'humidity_target',
    label: 'Humidity (%)',
    renderCell: (r) => r.humidity_target,
  },
  {
    key: 'duration_days',
    label: 'Duration (days)',
    sortValue: (r) => r.duration_days,
    renderCell: (r) => r.duration_days,
  },
  {
    key: 'created_at',
    label: 'Created',
    sortValue: (r) => r.created_at,
    renderCell: (r) => formatDate(r.created_at),
  },
];

export interface RecipesTableProps {
  recipes: Recipe[];
  onRowClick: (id: number) => void;
}

export function RecipesTable({ recipes, onRowClick }: RecipesTableProps) {
  return (
    <DataTable
      columns={columns}
      rows={recipes}
      onRowClick={onRowClick}
      emptyMessage="No recipes yet."
      initialSortKey="name"
      initialSortOrder="asc"
    />
  );
}

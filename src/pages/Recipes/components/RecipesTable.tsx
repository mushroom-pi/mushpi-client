import { Box, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import type { Recipe } from '~api/generated';

export interface RecipesTableProps {
  recipes: Recipe[];
  onRowClick: (id: number) => void;
}

type SortField = 'name' | 'species' | 'temperature_target' | 'duration_days' | 'created_at';
type SortOrder = 'asc' | 'desc';

function formatDate(iso: string) {
  return dayjs(iso).format('DD MMM YYYY HH:mm');
}

function sortRecipes(recipes: Recipe[], field: SortField, order: SortOrder): Recipe[] {
  return [...recipes].sort((a, b) => {
    let cmp = 0;
    if (field === 'name' || field === 'species') {
      cmp = a[field].localeCompare(b[field]);
    } else if (field === 'temperature_target' || field === 'duration_days') {
      cmp = a[field] - b[field];
    } else if (field === 'created_at') {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return order === 'asc' ? cmp : -cmp;
  });
}

export function RecipesTable({ recipes, onRowClick }: RecipesTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  const sorted = useMemo(() => sortRecipes(recipes, sortField, sortOrder), [recipes, sortField, sortOrder]);

  function col(field: SortField, label: string) {
    return (
      <TableCell sortDirection={sortField === field ? sortOrder : false}>
        <TableSortLabel
          active={sortField === field}
          direction={sortField === field ? sortOrder : 'asc'}
          onClick={() => handleSort(field)}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box py={4}>
        <Typography color="text.secondary">No recipes yet.</Typography>
      </Box>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {col('name', 'Name')}
          {col('species', 'Species')}
          {col('temperature_target', 'Temp (°C)')}
          <TableCell>Humidity (%)</TableCell>
          {col('duration_days', 'Duration (days)')}
          {col('created_at', 'Created')}
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((recipe) => (
          <TableRow
            key={recipe.id}
            hover
            onClick={() => onRowClick(recipe.id)}
            sx={{ cursor: 'pointer' }}
          >
            <TableCell>{recipe.name}</TableCell>
            <TableCell>{recipe.species}</TableCell>
            <TableCell>{recipe.temperature_target}</TableCell>
            <TableCell>{recipe.humidity_target}</TableCell>
            <TableCell>{recipe.duration_days}</TableCell>
            <TableCell>{formatDate(recipe.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

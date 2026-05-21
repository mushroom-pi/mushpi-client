import { Box, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';

import type { Recipe } from '~api/generated';
import { ReadableTime } from '~components';

export interface RecipesTableProps {
  recipes: Recipe[];
  onRowClick: (id: number) => void;
}

function formatCreated(iso: string) {
  return dayjs(iso).format('DD MMM YYYY HH:mm');
}

function createdAgeSeconds(iso: string) {
  return Math.max(dayjs().diff(dayjs(iso), 'second'), 0);
}

export function RecipesTable({ recipes, onRowClick }: RecipesTableProps) {
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
          <TableCell>Name</TableCell>
          <TableCell>Species</TableCell>
          <TableCell>Temp (°C)</TableCell>
          <TableCell>Humidity (%)</TableCell>
          <TableCell>Duration (days)</TableCell>
          <TableCell>Created</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {recipes.map((recipe) => (
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
            <TableCell>
              <Tooltip title={formatCreated(recipe.created_at)}>
                <Box component="span">
                  <ReadableTime seconds={createdAgeSeconds(recipe.created_at)} compact />
                </Box>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

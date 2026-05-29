import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';

import { EditableInfoCard, InfoField } from '~components';
import { useRecipeContext } from '~ctx/Recipe';

import { DeleteRecipeDialog } from './DeleteRecipeDialog';
import { EditRecipeDialog } from './EditRecipeDialog';

function formatTimestamp(value: string) {
  return dayjs(value).format('DD MMM YYYY HH:mm');
}

export function RecipeMeta() {
  const { recipe } = useRecipeContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!recipe) return null;

  return (
    <>
      <EditableInfoCard
        title="Recipe details"
        subtitle={`Updated ${formatTimestamp(recipe.updated_at)}`}
        onClickEdit={() => setEditOpen(true)}
        headerActions={
          <Tooltip title="Delete recipe">
            <IconButton
              aria-label="delete recipe"
              color="error"
              size="small"
              onClick={() => setDeleteOpen(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        <InfoField label="Name">
          <Typography>{recipe.name}</Typography>
        </InfoField>
        <InfoField label="Species">
          <Typography>{recipe.species}</Typography>
        </InfoField>
        <InfoField label="Temperature target">
          <Typography>{recipe.temperature_target} °C</Typography>
        </InfoField>
        <InfoField label="Humidity target">
          <Typography>{recipe.humidity_target}%</Typography>
        </InfoField>
        <InfoField label="Duration">
          <Typography>{recipe.duration_days} days</Typography>
        </InfoField>
        <InfoField label="Notes">
          <Typography>{recipe.notes || '—'}</Typography>
        </InfoField>
        <InfoField label="Created">
          <Typography>{formatTimestamp(recipe.created_at)}</Typography>
        </InfoField>
      </EditableInfoCard>

      <EditRecipeDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteRecipeDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}


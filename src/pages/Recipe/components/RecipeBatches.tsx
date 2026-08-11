import AddIcon from '@mui/icons-material/Add';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { recipeKeys } from '~api/queryKeys';
import { BatchesTable, CreateBatchDialog, InfoCard } from '~components';
import { useRecipeContext } from '~ctx/Recipe';

export function RecipeBatches() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { recipe, recipeBatches, isBatchesLoading } = useRecipeContext();
  const [createOpen, setCreateOpen] = useState(false);

  if (!recipe) return null;

  const batches = [...(recipeBatches ?? [])].sort(
    (a, b) => dayjs(b.start_at).valueOf() - dayjs(a.start_at).valueOf(),
  );

  return (
    <>
      <InfoCard
        title="Batches using this recipe"
        headerAction={
          <IconButton size="small" onClick={() => setCreateOpen(true)} title="New batch">
            <AddIcon fontSize="small" />
          </IconButton>
        }
      >
        {isBatchesLoading ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <BatchesTable
            batches={batches}
            onRowClick={(id) => navigate(`/batches/${id}`)}
            hideSpeciesColumn
            hideRecipeColumn
            disablePaper
          />
        )}
      </InfoCard>

      <CreateBatchDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: recipeKeys.batches(recipe.id) })}
        defaultValues={{
          recipeId: recipe.id,
          species: recipe.species ?? undefined,
          temperatureTarget: recipe.temperature_target ?? undefined,
          humidityTarget: recipe.humidity_target ?? undefined,
        }}
      />
    </>
  );
}

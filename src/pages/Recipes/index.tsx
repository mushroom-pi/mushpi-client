import { Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddNew, Error, Loading, PageTitle } from '~components';
import { useListRecipes } from '~ctx/Recipes';
import { Page } from '~layout/Page';

import { CreateRecipeDialog, RecipesTable } from './components';

export default function RecipesPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useListRecipes({ page: 1, limit: 20 });

  if (isLoading) return <Loading item="recipes" />;
  if (isError) return <Error item="recipes" error={error} refetch={() => void refetch()} />;

  const recipes = data?.items ?? [];

  return (
    <Page>
      <PageTitle
        mb={3}
        actions={
          <AddNew onClick={() => setCreateOpen(true)}>
            New Recipe
          </AddNew>
        }
      >
        Recipes
      </PageTitle>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing page {data?.page ?? 1} of {data?.pages ?? 1} — total: {data?.total ?? recipes.length}
      </Typography>

      <RecipesTable recipes={recipes} onRowClick={(id) => navigate(`/recipes/${id}`)} />

      <CreateRecipeDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Page>
  );
}

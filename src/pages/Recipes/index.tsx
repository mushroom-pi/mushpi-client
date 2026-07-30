import { Skeleton, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddNew, Error, PageTitle, TableSkeleton } from '~components';
import { useListRecipes } from '~ctx/Recipes';
import { Page } from '~layout/Page';

import { CreateRecipeDialog, RecipesTable } from './components';

export default function RecipesPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useListRecipes({ page: 1, limit: 20 });

  const recipes = data?.items ?? [];

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <TableSkeleton columns={6} rows={6} />
      </>
    );
  } else if (isError) {
    content = <Error compact item="recipes" error={error} refetch={() => void refetch()} />;
  } else {
    content = (
      <>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Showing page {data?.page ?? 1} of {data?.pages ?? 1} — total:{' '}
          {data?.total ?? recipes.length}
        </Typography>

        <RecipesTable recipes={recipes} onRowClick={(id) => navigate(`/recipes/${id}`)} />
      </>
    );
  }

  return (
    <Page>
      <PageTitle
        mb={3}
        actions={
          isLoading || isError ? (
            <Skeleton variant="rounded" width={140} height={36} />
          ) : (
            <AddNew onClick={() => setCreateOpen(true)}>New Recipe</AddNew>
          )
        }
      >
        Recipes
      </PageTitle>

      {content}

      <CreateRecipeDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Page>
  );
}

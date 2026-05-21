import { Stack } from '@mui/material';
import { useParams } from 'react-router-dom';

import { Error, Invalid, Loading, PageTitle } from '~components';
import { RecipeProvider, useRecipeContext } from '~ctx/Recipe';
import { Page } from '~layout/Page';

import { RecipeBatches } from './components/RecipeBatches';
import { RecipeMeta } from './components/RecipeMeta';

function RecipeDetailInner() {
  const { recipe, isLoading, isError, error, refetch } = useRecipeContext();

  if (isLoading) return <Loading item="recipe" />;
  if (isError || !recipe) return <Error item="recipe" error={error} refetch={refetch} />;

  return (
    <Page>
      <PageTitle mb={2.5}>{recipe.name}</PageTitle>
      <Stack spacing={2}>
        <RecipeMeta />
        <RecipeBatches />
      </Stack>
    </Page>
  );
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? Number(id) : null;

  if (!recipeId) return <Invalid item="recipe id" />;

  return (
    <RecipeProvider recipeId={recipeId}>
      <RecipeDetailInner />
    </RecipeProvider>
  );
}

import { Stack } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { DeleteButton, EditButton, Error, Invalid, ItemPage, Loading } from '~components';
import { RecipeProvider, useRecipeContext } from '~ctx/Recipe';

import { DeleteRecipeDialog } from './components/DeleteRecipeDialog';
import { EditRecipeDialog } from './components/EditRecipeDialog';
import { RecipeBatches } from './components/RecipeBatches';
import { RecipeMeta } from './components/RecipeMeta';

function RecipeDetailInner() {
  const { recipe, isLoading, isError, error, refetch } = useRecipeContext();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <Loading item="recipe" />;
  if (isError || !recipe) return <Error item="recipe" error={error} refetch={refetch} />;

  return (
    <ItemPage
      title={recipe.name}
      actions={
        <Stack direction="row" spacing={1}>
          <EditButton onClick={() => setEditOpen(true)} />
          <DeleteButton onClick={() => setDeleteOpen(true)} />
        </Stack>
      }
    >
      <Stack spacing={2}>
        <RecipeMeta />
        <RecipeBatches />
      </Stack>
      <EditRecipeDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteRecipeDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </ItemPage>
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

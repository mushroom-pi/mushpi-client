import { Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardTopRecipeDto } from '~api/generated';

interface MostUsedRecipesWidgetProps {
  recipes: DashboardTopRecipeDto[];
}

export function MostUsedRecipesWidget({ recipes }: MostUsedRecipesWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Most Used Recipes
        </Typography>
        {recipes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recipes yet —{' '}
            <Link
              component="button"
              onClick={() => navigate('/recipes')}
              sx={{ cursor: 'pointer' }}
            >
              create one to get started
            </Link>
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {recipes.map((recipe) => (
              <Chip
                key={recipe.id}
                label={`${recipe.name} · ${recipe.batchCount}`}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                variant="outlined"
                color="secondary"
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

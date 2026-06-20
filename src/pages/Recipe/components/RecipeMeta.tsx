import { Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

import { InfoCard, InfoField } from '~components';
import { useRecipeContext } from '~ctx/Recipe';

import { RecipeImage } from './RecipeImage';

function formatTimestamp(value: string) {
  return dayjs(value).format('DD MMM YYYY HH:mm');
}

export function RecipeMeta() {
  const { recipe } = useRecipeContext();

  if (!recipe) return null;

  return (
    <InfoCard title="Recipe details" subtitle={`Updated ${formatTimestamp(recipe.updated_at)}`}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={1}>
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
            <InfoField label="Created">
              <Typography>{formatTimestamp(recipe.created_at)}</Typography>
            </InfoField>
            <InfoField label="Notes">
              <Typography>{recipe.notes || '—'}</Typography>
            </InfoField>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecipeImage />
        </Grid>
      </Grid>
    </InfoCard>
  );
}

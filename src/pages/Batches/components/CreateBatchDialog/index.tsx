import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

import { BatchForm } from '~components';

import { type CreateBatchDialogProps } from './interfaces';
import { useCreateBatchForm } from './useCreateBatchForm';

export const CreateBatchDialog = ({ open, onClose, defaultValues }: CreateBatchDialogProps) => {
  const {
    picoUnitId,
    startAt,
    finishAt,
    description,
    species,
    temperatureTarget,
    humidityTarget,
    notes,
    recipeId,
    setFinishAt,
    setDescription,
    setSpecies,
    setTemperatureTarget,
    setHumidityTarget,
    setNotes,
    picoUnits,
    recipes,
    busyUnitIds,
    startAtConflict,
    finishBeforeStartError,
    canSubmit,
    handleUnitChange,
    handleRecipeChange,
    handleStartAtChange,
    handleCreate,
    isPending,
  } = useCreateBatchForm({ open, onClose, defaultValues });

  return (
    <BatchForm
      open={open}
      onClose={onClose}
      title="New Batch"
      submitLabel="Create"
      pendingLabel="Creating…"
      onSubmit={handleCreate}
      canSubmit={canSubmit}
      isPending={isPending}
      description={description}
      setDescription={setDescription}
      species={species}
      setSpecies={setSpecies}
      temperatureTarget={temperatureTarget}
      setTemperatureTarget={setTemperatureTarget}
      humidityTarget={humidityTarget}
      setHumidityTarget={setHumidityTarget}
      startAt={startAt}
      onStartAtChange={handleStartAtChange}
      startAtError={startAtConflict}
      finishAt={finishAt}
      setFinishAt={setFinishAt}
      finishBeforeStartError={finishBeforeStartError}
      notes={notes}
      setNotes={setNotes}
      topSlot={
        <>
          <FormControl fullWidth required>
            <InputLabel id="create-batch-unit-label">Pico Unit</InputLabel>
            <Select
              labelId="create-batch-unit-label"
              value={picoUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              label="Pico Unit"
            >
              {picoUnits.map((unit) => {
                const isBusy = busyUnitIds.has(unit.id);
                return (
                  <MenuItem
                    key={unit.id}
                    value={String(unit.id)}
                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box>{unit.name ?? unit.handle}</Box>
                    {isBusy && (
                      <Typography variant="caption" color="warning.main">
                        ⚠ Active batch — future start only
                      </Typography>
                    )}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="create-batch-recipe-label">Recipe</InputLabel>
            <Select
              labelId="create-batch-recipe-label"
              value={recipeId}
              onChange={(e) => handleRecipeChange(e.target.value)}
              label="Recipe"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {recipes.map((recipe) => (
                <MenuItem key={recipe.id} value={String(recipe.id)}>
                  {recipe.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      }
    />
  );
};

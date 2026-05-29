import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Batch</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={0.5}>
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

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Optional name or label for this batch"
          />

          <TextField
            label="Start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => handleStartAtChange(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!startAtConflict}
            helperText={startAtConflict ?? undefined}
          />
          <TextField
            label="Finish"
            type="datetime-local"
            value={finishAt}
            onChange={(e) => setFinishAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!finishBeforeStartError}
            helperText={finishBeforeStartError ?? undefined}
          />
          <TextField
            label="Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            fullWidth
          />
          <TextField
            label="Temperature Target (°C)"
            type="number"
            value={temperatureTarget}
            onChange={(e) => setTemperatureTarget(e.target.value)}
            fullWidth
          />
          <TextField
            label="Humidity Target (%)"
            type="number"
            value={humidityTarget}
            onChange={(e) => setHumidityTarget(e.target.value)}
            fullWidth
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={!canSubmit || isPending}>
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

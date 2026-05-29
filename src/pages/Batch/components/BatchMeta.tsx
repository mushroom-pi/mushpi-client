import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { BatchStatusEnum, UpdateBatchDto } from '~api/generated';
import { EditableInfoCard, InfoField, PageTitle } from '~components';
import { useBatchContext } from '~ctx/Batch';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import { toDateTimeLocal } from '~utils/methods';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'In progress';
  return dayjs(value).format('DD MMM YYYY HH:mm');
};

export const BatchMeta = () => {
  const navigate = useNavigate();
  const { run } = useAsyncWithToast();
  const { batch, updateBatch, deleteBatch, createRecipeFromBatch } = useBatchContext();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveRecipeOpen, setSaveRecipeOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState('');
  const [temperatureTarget, setTemperatureTarget] = useState('');
  const [humidityTarget, setHumidityTarget] = useState('');
  const [startAt, setStartAt] = useState('');
  const [finishAt, setFinishAt] = useState('');
  const [notes, setNotes] = useState('');

  const [recipeName, setRecipeName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');

  useEffect(() => {
    if (!editOpen || !batch) return;

    setDescription(batch.description ?? '');
    setSpecies(batch.species ?? '');
    setTemperatureTarget(batch.temperature_target != null ? String(batch.temperature_target) : '');
    setHumidityTarget(batch.humidity_target != null ? String(batch.humidity_target) : '');
    setStartAt(toDateTimeLocal(batch.start_at));
    setFinishAt(toDateTimeLocal(batch.finish_at));
    setNotes(batch.notes ?? '');
  }, [batch, editOpen]);

  useEffect(() => {
    if (!saveRecipeOpen || !batch) return;

    setRecipeName(batch.recipe?.name ?? batch.species?.trim() ?? `Batch ${batch.id}`);
    setRecipeNotes(batch.notes ?? '');
  }, [batch, saveRecipeOpen]);

  const statusChip = useMemo(() => {
    const STATUS_LABEL: Record<BatchStatusEnum, string> = {
      planned: 'Planned',
      'in-progress': 'In progress',
      finished: 'Finished',
    };
    const STATUS_COLOR: Record<BatchStatusEnum, 'info' | 'warning' | 'success'> = {
      planned: 'info',
      'in-progress': 'warning',
      finished: 'success',
    };
    const status = batch?.status ?? 'in-progress';
    return <Chip label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} size="small" />;
  }, [batch?.status]);

  if (!batch) {
    return null;
  }

  const hasRecipeName = recipeName.trim().length > 0;

  const handleUpdate = async () => {
    const body: UpdateBatchDto = {};

    const newDescription = description.trim() || null;
    if (newDescription !== (batch.description ?? null)) {
      body.description = newDescription;
    }

    const newSpecies = species.trim() || undefined;
    const oldSpecies = batch.species?.trim() || undefined;
    if (newSpecies !== oldSpecies) {
      body.species = newSpecies;
    }

    const newTempTarget = temperatureTarget === '' ? undefined : Number(temperatureTarget);
    const oldTempTarget = batch.temperature_target ?? undefined;
    if (newTempTarget !== oldTempTarget) {
      body.temperature_target = newTempTarget;
    }

    const newHumTarget = humidityTarget === '' ? undefined : Number(humidityTarget);
    const oldHumTarget = batch.humidity_target ?? undefined;
    if (newHumTarget !== oldHumTarget) {
      body.humidity_target = newHumTarget;
    }

    // Compare using datetime-local strings to avoid sub-minute precision false positives
    if (startAt !== toDateTimeLocal(batch.start_at)) {
      body.start_at = dayjs(startAt).toISOString();
    }

    if (finishAt !== toDateTimeLocal(batch.finish_at)) {
      body.finish_at = finishAt ? dayjs(finishAt).toISOString() : null;
    }

    if (notes !== (batch.notes ?? '')) {
      body.notes = notes;
    }

    if (Object.keys(body).length === 0) {
      setEditOpen(false);
      return;
    }

    try {
      await run(() => updateBatch.mutateAsync({ batchId: batch.id, body }), {
        successMessage: 'Batch updated successfully',
        fallbackErrorMessage: 'Failed to update batch',
        onSuccess: () => setEditOpen(false),
      });
    } catch {
      // Error already displayed via toast by run()
    }
  };

  const handleDelete = async () => {
    await run(() => deleteBatch.mutateAsync(batch.id), {
      successMessage: 'Batch deleted successfully',
      fallbackErrorMessage: 'Failed to delete batch',
      onSuccess: () => {
        setDeleteOpen(false);
        navigate('/batches');
      },
    });
  };

  const handleSaveRecipe = async () => {
    await run(
      () =>
        createRecipeFromBatch.mutateAsync({
          batchId: batch.id,
          name: recipeName.trim(),
          notes: recipeNotes.trim() || undefined,
        }),
      {
        successMessage: 'Recipe saved from batch',
        fallbackErrorMessage: 'Failed to save recipe from batch',
        onSuccess: () => setSaveRecipeOpen(false),
      },
    );
  };

  return (
    <Box>
      <PageTitle
        mb={2}
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {batch.status === 'finished' ? (
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => setSaveRecipeOpen(true)}
              >
                Save as Recipe
              </Button>
            ) : null}
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      >
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <span>{batch.description ?? `Batch #${batch.id}`}</span>
          {statusChip}
        </Box>
      </PageTitle>

      <EditableInfoCard
        title="Batch details"
        subtitle="Metadata, targets, notes, and recipe links"
        onClickEdit={() => setEditOpen(true)}
      >
        <InfoField label="Pico Unit">
          <Link to={`/pico-units/${batch.pico_unit_id}`}>
            {batch.pico_unit.name ?? batch.pico_unit.handle ?? `Pico Unit #${batch.pico_unit_id}`}
          </Link>
        </InfoField>
        <InfoField label="Description">
          <Typography variant="body1">{batch.description || '—'}</Typography>
        </InfoField>
        <InfoField label="Species">
          <Typography variant="body1">{batch.species ?? '—'}</Typography>
        </InfoField>
        <InfoField label="Temperature Target">
          <Typography variant="body1">
            {batch.temperature_target != null ? `${batch.temperature_target} °C` : '—'}
          </Typography>
        </InfoField>
        <InfoField label="Humidity Target">
          <Typography variant="body1">
            {batch.humidity_target != null ? `${batch.humidity_target} %` : '—'}
          </Typography>
        </InfoField>
        <InfoField label="Start">
          <Typography variant="body1">{formatDateTime(batch.start_at)}</Typography>
        </InfoField>
        <InfoField label="Finish">
          <Typography variant="body1">{formatDateTime(batch.finish_at)}</Typography>
        </InfoField>
        <InfoField label="Status" display="beside">
          {statusChip}
        </InfoField>
        <InfoField label="Recipe">
          {batch.recipe ? <Link to={`/recipes/${batch.recipe.id}`}>{batch.recipe.name}</Link> : '—'}
        </InfoField>
        <InfoField label="Notes">
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {batch.notes || '—'}
          </Typography>
        </InfoField>
      </EditableInfoCard>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Batch</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              placeholder="Optional name or label for this batch"
            />
            <TextField
              label="Species"
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
              fullWidth
            />
            <TextField
              label="Temperature Target (°C)"
              type="number"
              value={temperatureTarget}
              onChange={(event) => setTemperatureTarget(event.target.value)}
              fullWidth
            />
            <TextField
              label="Humidity Target (%)"
              type="number"
              value={humidityTarget}
              onChange={(event) => setHumidityTarget(event.target.value)}
              fullWidth
            />
            <TextField
              label="Start"
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Finish"
              type="datetime-local"
              value={finishAt}
              onChange={(event) => setFinishAt(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={updateBatch.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updateBatch.isLoading || !startAt}
          >
            {updateBatch.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete Batch</DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action permanently deletes batch #{batch.id}. This cannot be undone.
            </Alert>
            Are you sure you want to delete this batch?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteBatch.isLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteBatch.isLoading}
          >
            {deleteBatch.isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={saveRecipeOpen}
        onClose={() => setSaveRecipeOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Save Batch as Recipe</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              label="Name"
              value={recipeName}
              onChange={(event) => setRecipeName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Notes"
              value={recipeNotes}
              onChange={(event) => setRecipeNotes(event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSaveRecipeOpen(false)}
            disabled={createRecipeFromBatch.isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRecipe}
            disabled={!hasRecipeName || createRecipeFromBatch.isLoading}
          >
            {createRecipeFromBatch.isLoading ? 'Saving…' : 'Save Recipe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

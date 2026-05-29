import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EditableInfoCard, InfoField, PageTitle } from '~components';
import { useBatchContext } from '~ctx/Batch';
import { StatusChip } from '~pages/Batches/components/StatusChip';

import { DeleteBatchDialog } from './DeleteBatchDialog';
import { EditBatchDialog } from './EditBatchDialog';
import { SaveAsRecipeDialog } from './SaveAsRecipeDialog';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'In progress';
  return dayjs(value).format('DD MMM YYYY HH:mm');
};

export const BatchMeta = () => {
  const navigate = useNavigate();
  const { batch } = useBatchContext();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveRecipeOpen, setSaveRecipeOpen] = useState(false);

  if (!batch) return null;

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
          <StatusChip status={batch.status} />
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
          <StatusChip status={batch.status} />
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

      <EditBatchDialog open={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteBatchDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => navigate('/batches')}
      />
      <SaveAsRecipeDialog open={saveRecipeOpen} onClose={() => setSaveRecipeOpen(false)} />
    </Box>
  );
};

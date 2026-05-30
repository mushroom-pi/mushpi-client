import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { InfoCard, InfoField } from '~components';
import { useBatchContext } from '~ctx/Batch';
import { StatusChip } from '~pages/Batches/components/StatusChip';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'In progress';
  return dayjs(value).format('DD MMM YYYY HH:mm');
};

export const BatchMeta = () => {
  const { batch } = useBatchContext();

  if (!batch) return null;

  return (
    <InfoCard title="Batch details" subtitle="Metadata, targets, notes, and recipe links">
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
    </InfoCard>
  );
};

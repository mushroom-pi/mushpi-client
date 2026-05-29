import { BatchForm } from '~components';

import type { EditBatchDialogProps } from './interfaces';
import { useEditBatchForm } from './useEditBatchForm';

export const EditBatchDialog = ({ open, onClose }: EditBatchDialogProps) => {
  const {
    description,
    setDescription,
    species,
    setSpecies,
    temperatureTarget,
    setTemperatureTarget,
    humidityTarget,
    setHumidityTarget,
    startAt,
    handleStartAtChange,
    finishAt,
    setFinishAt,
    notes,
    setNotes,
    finishBeforeStartError,
    canSubmit,
    handleUpdate,
    isPending,
  } = useEditBatchForm({ open, onClose });

  return (
    <BatchForm
      open={open}
      onClose={onClose}
      title="Edit Batch"
      submitLabel="Save"
      pendingLabel="Saving…"
      onSubmit={handleUpdate}
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
      finishAt={finishAt}
      setFinishAt={setFinishAt}
      finishBeforeStartError={finishBeforeStartError}
      notes={notes}
      setNotes={setNotes}
    />
  );
};

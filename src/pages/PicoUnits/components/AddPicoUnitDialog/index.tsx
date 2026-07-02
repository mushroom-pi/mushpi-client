import { TextField } from '@mui/material';

import { HeaderAndIcon, ModalForm } from '~components';

import type { AddPicoUnitDialogProps } from './interfaces';
import { useAddPicoUnitForm } from './useAddPicoUnitForm';

export const AddPicoUnitDialog: React.FC<AddPicoUnitDialogProps> = (props) => {
  const { open, onClose } = props;
  const { handle, updateHandle, errors, isValid, isPending, handleSubmit, reset } =
    useAddPicoUnitForm(props);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <ModalForm
      open={open}
      onClose={handleClose}
      title={<HeaderAndIcon title="Add Pico Unit" />}
      submitLabel={isPending ? 'Adding…' : 'Add'}
      pendingLabel="Adding…"
      canSubmit={isValid && !isPending}
      isPending={isPending}
      onSubmit={handleSubmit}
      blockCloseWhenPending
    >
      <TextField
        label="Handle"
        value={handle}
        onChange={(e) => updateHandle(e.target.value)}
        fullWidth
        error={!!errors.handle}
        helperText={errors.handle ?? 'Unique identifier for the device on the network'}
        disabled={isPending}
        autoFocus
      />
    </ModalForm>
  );
};

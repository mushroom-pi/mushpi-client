import { TextField } from '@mui/material';

import { HeaderAndIcon, ModalForm } from '~components';

import type { ManualRegisterDialogProps } from './interfaces';
import { useManualRegisterForm } from './useManualRegisterForm';

export const ManualRegisterDialog: React.FC<ManualRegisterDialogProps> = (props) => {
  const { open, onClose } = props;
  const { handle, updateHandle, errors, isValid, isPending, handleSubmit, reset } =
    useManualRegisterForm(props);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <ModalForm
      open={open}
      onClose={handleClose}
      title={<HeaderAndIcon title="Register Pico Manually" />}
      submitLabel={isPending ? 'Registering…' : 'Register'}
      pendingLabel="Registering…"
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

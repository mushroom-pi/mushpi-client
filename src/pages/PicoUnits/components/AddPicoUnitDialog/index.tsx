import { TextField } from '@mui/material';

import { HeaderAndIcon, ModalForm } from '~components';

import type { AddPicoUnitDialogProps } from './interfaces';
import { useAddPicoUnitForm } from './useAddPicoUnitForm';

export const AddPicoUnitDialog: React.FC<AddPicoUnitDialogProps> = (props) => {
  const { open, onClose } = props;
  const { handle, updateHandle, errors, isValid, step, handleSearch, reset } =
    useAddPicoUnitForm(props);

  const isSearching = step === 'searching';

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <ModalForm
      open={open}
      onClose={handleClose}
      title={<HeaderAndIcon title="Add Pico Unit" />}
      submitLabel="Search"
      pendingLabel="Searching…"
      canSubmit={isValid && !isSearching}
      isPending={isSearching}
      onSubmit={handleSearch}
      blockCloseWhenPending
    >
      <TextField
        label="Handle"
        value={handle}
        onChange={(e) => updateHandle(e.target.value)}
        fullWidth
        error={!!errors.handle}
        helperText={errors.handle ?? 'Unique identifier for the device on the network'}
        disabled={isSearching}
        autoFocus
      />
    </ModalForm>
  );
};

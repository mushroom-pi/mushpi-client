import { Alert, DialogContentText, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useEffect, useState } from 'react';

import { ConfirmDialog } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';

interface RebootPicoDialogProps {
  open: boolean;
  onClose: () => void;
  picoUnitId: number;
  isOffline: boolean;
}

export const RebootPicoDialog: React.FC<RebootPicoDialogProps> = ({
  open,
  onClose,
  picoUnitId,
  isOffline,
}) => {
  const [type, setType] = useState<'soft' | 'hard'>('soft');
  const { rebootPico } = usePicoUnitContext();
  const { run } = useAsyncWithToast();
  const isLoading = rebootPico.isLoading;

  useEffect(() => {
    if (open) {
      setType('soft');
    }
  }, [open]);

  async function doReboot() {
    await run(
      () => rebootPico.mutateAsync({ picoUnitId, body: { type } }),
      {
        successMessage: 'Reboot initiated',
        fallbackErrorMessage: 'Failed to reboot pico unit',
        onSuccess: () => onClose(),
      },
    );
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Reboot Pico Unit"
      confirmLabel="Reboot"
      isLoading={isLoading}
      onConfirm={doReboot}
      danger
    >
      <DialogContentText paragraph>
        Choose the type of reboot to perform. A soft reboot is faster and preserves cumulative
        uptime; a hard reboot performs a full power-cycle.
      </DialogContentText>
      <FormControl component="fieldset">
        <RadioGroup value={type} onChange={(e) => setType(e.target.value as 'soft' | 'hard')}>
          <FormControlLabel
            value="soft"
            control={<Radio />}
            label="Soft reboot — machine.soft_reset() — preserves cumulative uptime, faster restart"
          />
          <FormControlLabel
            value="hard"
            control={<Radio />}
            label="Hard reboot — machine.reset() — full power-cycle, uptime resets to 0"
          />
        </RadioGroup>
      </FormControl>
      <Alert severity="warning" variant="filled" sx={{ mt: 2 }}>
        The unit will be unresponsive for 5–10 seconds during restart.
      </Alert>
      {isOffline && (
        <Alert severity="error" variant="filled" sx={{ mt: 2 }}>
          This unit appears to be offline. The reboot command may not reach the device.
        </Alert>
      )}
    </ConfirmDialog>
  );
};

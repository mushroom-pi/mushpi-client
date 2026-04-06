import FanIcon from '@mui/icons-material/WindPower';
import { Alert, Stack } from '@mui/material';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { ChangeOutputsDto } from '~api/generated';
import { HeaderAndIcon, ModalDialog, OnOffInput } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import type { DialogProps } from '~int/dialogProps';

export const DevicesDialog: React.FC<DialogProps> = ({ open, onClose, closeOnSave = true }) => {
  const { pico, changeOutputs } = usePicoUnitContext();
  const { run } = useAsyncWithToast();
  if (!pico || !pico.latest_reading) return;

  const { latest_reading: lr } = pico;

  const [humidifierOn, setHumidifierOn] = useState<boolean | null>(lr.humidifier_on ?? null);
  const [fanOn, setFanOn] = useState<boolean | null>(lr.fan_on ?? null);
  const [heaterOn, setHeaterOn] = useState<boolean | null>(lr.heater_on ?? null);

  useEffect(() => {
    if (!open) return;
    if (!pico || !lr) {
      setHumidifierOn(null);
      setFanOn(null);
      setHeaterOn(null);
      return;
    }
    setHumidifierOn(lr.humidifier_on);
    setFanOn(lr.fan_on);
    setHeaterOn(lr.heater_on);
  }, [open, lr.heater_on, lr.fan_on, lr.humidifier_on]);

  const hasChanges = useMemo(() => {
    if (!pico || !lr) return false;
    return humidifierOn !== lr.humidifier_on || fanOn !== lr.fan_on || heaterOn !== lr.heater_on;
  }, [pico, fanOn, heaterOn, humidifierOn]);

  async function doSaveChanges() {
    if (!pico || !lr) return;
    const body: ChangeOutputsDto = {
      humidifier: humidifierOn === null ? undefined : humidifierOn,
      fan: fanOn === null ? undefined : fanOn,
      heater: heaterOn === null ? undefined : heaterOn,
    };

    await run(() => changeOutputs!.mutateAsync({ picoUnitId: pico.id, body }), {
      successMessage: "Devices' outputs changed successfully",
      fallbackErrorMessage: "Failed to change the devices' outputs",
      onSuccess: () => {
        if (closeOnSave) onClose();
      },
    });
  }

  function handleCancel() {
    if (pico && lr) {
      setHumidifierOn(lr.humidifier_on);
      setFanOn(lr.fan_on);
      setHeaterOn(lr.heater_on);
    } else {
      setHumidifierOn(null);
      setFanOn(null);
      setHeaterOn(null);
    }
    onClose();
  }

  return (
    open && (
      <ModalDialog
        open={open}
        onClose={onClose}
        doSaveChanges={doSaveChanges}
        handleCancel={handleCancel}
        hasChanges={hasChanges}
        isSaving={changeOutputs?.isLoading}
        headerAndIcon={<HeaderAndIcon title="Devices" icon={<FanIcon />} />}
      >
        <Alert
          severity={lr.control_loop_enabled ? 'warning' : 'info'}
          variant="outlined"
          sx={{ m: 1, mb: 2, borderRadius: 2 }}
        >
          {lr.control_loop_enabled
            ? 'While the control loop is on, the devices cannot be turned on and/or off manually, since the unit controls them.'
            : 'With the control loop disabled, the devices can be turned on and/or off manually.'}
        </Alert>
        <Stack spacing={2} mt={1} mb={1} ml={10}>
          <OnOffInput
            label="Humidifier"
            value={!!humidifierOn}
            setter={setHumidifierOn}
            disabled={lr.control_loop_enabled}
          />
          <OnOffInput
            label="Fan"
            value={!!fanOn}
            setter={setFanOn}
            disabled={lr.control_loop_enabled}
          />
          <OnOffInput
            label="Heater"
            value={!!heaterOn}
            setter={setHeaterOn}
            disabled={lr.control_loop_enabled}
          />
        </Stack>
      </ModalDialog>
    )
  );
};

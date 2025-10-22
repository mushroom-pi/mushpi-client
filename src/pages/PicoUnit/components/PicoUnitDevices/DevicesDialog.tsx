import FanIcon from '@mui/icons-material/WindPower';
import { Stack } from '@mui/material';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { ChangeOutputsDto } from '~api/generated';
import { HeaderAndIcon } from '~comp/HeaderAndIcon';
import { ModalDialog } from '~comp/ModalDialog';
import { OnOffInput } from '~comp/OnOffInput';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { DialogProps } from '~int/dialogProps';

export const DevicesDialog: React.FC<DialogProps> = ({ open, onClose, closeOnSave = true }) => {
  const { pico, changeOutputs } = usePicoUnitContext();
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

    try {
      await changeOutputs?.mutateAsync({ picoUnitId: pico.id, body });
      if (closeOnSave) onClose();
    } catch (error) {
      console.error('Failed to update pico unit', error);
    }
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
        <Stack spacing={2} mt={1} mb={1} ml={10}>
          <OnOffInput label="Humidifier" value={!!humidifierOn} setter={setHumidifierOn} />
          <OnOffInput label="Fan" value={!!fanOn} setter={setFanOn} />
          <OnOffInput label="Heater" value={!!heaterOn} setter={setHeaterOn} />
        </Stack>
      </ModalDialog>
    )
  );
};

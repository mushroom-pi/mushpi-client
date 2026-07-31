import ConnectionsIcon from '@mui/icons-material/SettingsInputComponent';
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import type { ChangeSetupDto } from '~api/generated';
import { schemas } from '~api/generated/schemas';
import { HeaderAndIcon, PicoUnitForm } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import { useAsyncWithToast } from '~hook/useAsyncWithToast';
import type { DialogProps } from '~int/dialogProps';

import { MappingPreview } from './MappingPreview';
import {
  DEFAULT_PINS,
  PIN_RANGE,
  PICO_PINOUT_DOC_URL,
} from './picoPinout';

type PinKey = 'dht' | 'humidifier' | 'fan' | 'heater';

const PIN_LABELS: Record<PinKey, string> = {
  dht: 'DHT11 Sensor',
  humidifier: 'Humidifier',
  fan: 'Fan',
  heater: 'Heater',
};

export const MappingDialog: React.FC<DialogProps> = ({ open, onClose, closeOnSave = true }) => {
  const { pico, changeSetup } = usePicoUnitContext();
  const { run } = useAsyncWithToast();

  if (!pico) return null;

  const currentDevices = (pico as any).devices ?? {
    pins: { ...DEFAULT_PINS },
  };

  const [acknowledged, setAcknowledged] = useState(false);
  const [pins, setPins] = useState<Record<PinKey, number>>({ ...DEFAULT_PINS });

  useEffect(() => {
    if (!open) return;
    setAcknowledged(false);
    setPins({
      dht: currentDevices.pins?.dht ?? DEFAULT_PINS.dht,
      humidifier: currentDevices.pins?.humidifier ?? DEFAULT_PINS.humidifier,
      fan: currentDevices.pins?.fan ?? DEFAULT_PINS.fan,
      heater: currentDevices.pins?.heater ?? DEFAULT_PINS.heater,
    });
  }, [open, currentDevices]);

  const errors = useMemo(() => {
    const result = schemas.ChangeSetupDto.safeParse({
      pins: { dht: pins.dht, humidifier: pins.humidifier, fan: pins.fan, heater: pins.heater },
    });
    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (path.includes('dht')) fieldErrors.dht = issue.message;
        else if (path.includes('humidifier')) fieldErrors.humidifier = issue.message;
        else if (path.includes('fan')) fieldErrors.fan = issue.message;
        else if (path.includes('heater')) fieldErrors.heater = issue.message;
      }
    }
    // Form-level required checks (schema is .partial())
    for (const key of ['dht', 'humidifier', 'fan', 'heater'] as PinKey[]) {
      if (Number.isNaN(pins[key])) {
        fieldErrors[key] = 'Required';
      }
    }
    // Duplicate pin validation
    const pinToFields = new Map<number, PinKey[]>();
    for (const key of ['dht', 'humidifier', 'fan', 'heater'] as PinKey[]) {
      const val = pins[key];
      if (!Number.isNaN(val)) {
        const existing = pinToFields.get(val) ?? [];
        existing.push(key);
        pinToFields.set(val, existing);
      }
    }
    for (const [, fields] of pinToFields) {
      if (fields.length > 1) {
        for (const field of fields) {
          const others = fields.filter((f) => f !== field).map((f) => PIN_LABELS[f]);
          fieldErrors[field] = `GP${pins[field]} is already assigned to ${others.join(', ')}`;
        }
      }
    }
    return fieldErrors;
  }, [pins]);

  const isValid = Object.keys(errors).length === 0;

  const hasChanges = useMemo(() => {
    return (
      pins.dht !== currentDevices.pins?.dht ||
      pins.humidifier !== currentDevices.pins?.humidifier ||
      pins.fan !== currentDevices.pins?.fan ||
      pins.heater !== currentDevices.pins?.heater
    );
  }, [pins, currentDevices]);

  const canSubmit = acknowledged && hasChanges && isValid;

  function handlePinChange(key: PinKey, rawValue: string) {
    const num = rawValue === '' ? NaN : Number(rawValue);
    setPins((prev) => ({ ...prev, [key]: num }));
  }

  async function doSaveChanges() {
    if (!pico) return;
    const body: ChangeSetupDto = {};

    const changedPins: Record<string, number> = {};
    for (const key of ['dht', 'humidifier', 'fan', 'heater'] as PinKey[]) {
      if (pins[key] !== currentDevices.pins?.[key]) {
        changedPins[key] = Number(pins[key]);
      }
    }
    if (Object.keys(changedPins).length > 0) {
      body.pins = changedPins;
    }

    await run(() => changeSetup!.mutateAsync({ picoUnitId: pico.id, body }), {
      successMessage: 'Pin mapping changed successfully',
      fallbackErrorMessage: 'Failed to change the pin mapping',
      onSuccess: () => {
        if (closeOnSave) onClose();
      },
    });
  }

  function handleCancel() {
    setPins({
      dht: currentDevices.pins?.dht ?? DEFAULT_PINS.dht,
      humidifier: currentDevices.pins?.humidifier ?? DEFAULT_PINS.humidifier,
      fan: currentDevices.pins?.fan ?? DEFAULT_PINS.fan,
      heater: currentDevices.pins?.heater ?? DEFAULT_PINS.heater,
    });
    setAcknowledged(false);
    onClose();
  }

  const currentForPreview = {
    pins: {
      dht: currentDevices.pins?.dht ?? DEFAULT_PINS.dht,
      humidifier: currentDevices.pins?.humidifier ?? DEFAULT_PINS.humidifier,
      fan: currentDevices.pins?.fan ?? DEFAULT_PINS.fan,
      heater: currentDevices.pins?.heater ?? DEFAULT_PINS.heater,
    },
  };

  const proposedForPreview = {
    pins: {
      dht: Number(pins.dht) || 0,
      humidifier: Number(pins.humidifier) || 0,
      fan: Number(pins.fan) || 0,
      heater: Number(pins.heater) || 0,
    },
  };

  return (
    open && (
      <PicoUnitForm
        open={open}
        onClose={handleCancel}
        onSubmit={doSaveChanges}
        canSubmit={canSubmit}
        isPending={changeSetup?.isLoading}
        title={<HeaderAndIcon title="PIN Mapping" icon={<ConnectionsIcon />} />}
      >
        <Stack spacing={2} m={1}>
          <Alert severity="warning" variant="filled">
            Changing pin assignments will physically alter which GPIO pins control your devices.
            Incorrect pin assignments can cause hardware malfunction. Proceed with caution.
          </Alert>

          <Typography variant="body2">
            See the{' '}
            <Link href={PICO_PINOUT_DOC_URL} target="_blank" rel="noopener">
              official Raspberry Pi Pico pinout documentation
            </Link>{' '}
            for GPIO pin reference.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
            }
            label="I understand the risks and have verified my wiring"
          />

          <Stack spacing={2}>
            {(['dht', 'humidifier', 'fan', 'heater'] as PinKey[]).map((key) => (
              <TextField
                key={key}
                label={PIN_LABELS[key]}
                type="number"
                value={pins[key]}
                onChange={(e) => handlePinChange(key, e.target.value)}
                disabled={!acknowledged}
                error={!!errors[key]}
                helperText={errors[key] ?? 'Valid GPIO: 0–22, 26–28'}
                inputProps={{ min: PIN_RANGE.min, max: PIN_RANGE.max }}
                size="small"
              />
            ))}
          </Stack>

          <MappingPreview current={currentForPreview} proposed={proposedForPreview} />

          <Typography variant="body2">
            <Link href="https://pico2w.pinout.xyz/" target="_blank" rel="noopener">
              Interactive Pico 2W pinout ↗
            </Link>
          </Typography>
        </Stack>
      </PicoUnitForm>
    )
  );
};

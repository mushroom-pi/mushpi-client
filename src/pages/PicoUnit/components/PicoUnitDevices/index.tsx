import FanIcon from '@mui/icons-material/WindPower';
import type React from 'react';
import { useState } from 'react';

import { EditableInfoCard } from '~comp/EditableInfoCard';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { DevicesDialog } from './DevicesDialog';
import { DevicesInfo } from './DevicesInfo';

export const PicoUnitDevices: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return !pico || !pico.latest_reading ? (
    <Loading />
  ) : (
    <>
      <EditableInfoCard title="Devices" icon={<FanIcon />} onClickEdit={() => setDialogOpen(true)}>
        <DevicesInfo />
      </EditableInfoCard>
      <DevicesDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

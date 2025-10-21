import TuneIcon from '@mui/icons-material/Tune';
import type React from 'react';
import { useState } from 'react';

import { EditableInfoCard } from '~comp/EditableInfoCard';
import { Loading } from '~comp/Loading';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { ControlsDialog } from './ControlsDialog';
import { ControlsInfo } from './ControlsInfo';

export const PicoUnitControls: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return !pico || !pico.latest_reading ? (
    <Loading />
  ) : (
    <>
      <EditableInfoCard
        title="Controls"
        icon={<TuneIcon />}
        onClickEdit={() => setDialogOpen(true)}
      >
        <ControlsInfo />
      </EditableInfoCard>

      {dialogOpen && <ControlsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
    </>
  );
};

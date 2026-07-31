import ConnectionsIcon from '@mui/icons-material/SettingsInputComponent';
import type React from 'react';
import { useState } from 'react';

import { EditableInfoCard, Loading } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { MappingDialog } from './MappingDialog';
import { MappingInfo } from './MappingInfo';

export const PicoUnitMapping: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  if (!pico) return <Loading />;

  return (
    <>
      <EditableInfoCard
        title="PIN Mapping"
        icon={<ConnectionsIcon />}
        onClickEdit={() => setDialogOpen(true)}
      >
        <MappingInfo />
      </EditableInfoCard>

      <MappingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

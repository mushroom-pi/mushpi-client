import ThermostatIcon from '@mui/icons-material/Thermostat';
import React from 'react';

import { BigDisplay } from 'src/components/BigDisplay';
import { InfoCard } from 'src/components/InfoCard';
import { InfoField } from 'src/components/InfoField';
import { Loading } from 'src/components/Loading';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';
import type { OptionalPicoUnitProps } from 'src/interfaces/optionalPicoUnit';

export const PicoUnitOverview: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  return (
    <InfoCard title="Overview" subtitle="General status" icon={<ThermostatIcon />}>
      {pico ? (
        <>
          <InfoField label="Last seen">
            <BigDisplay content={pico.last_seen} type="date" />
          </InfoField>
          <InfoField label="Created at">
            <BigDisplay content={pico.created_at} type="date" />
          </InfoField>
          <InfoField label="Host:Port">
            <BigDisplay content={`${pico.host}:${pico.port}`} />
          </InfoField>
        </>
      ) : (
        <Loading />
      )}
    </InfoCard>
  );
};

import MemoryIcon from '@mui/icons-material/Memory';
import React, { useMemo } from 'react';

import { BigDisplay } from 'src/components/BigDisplay';
import { InfoCard } from 'src/components/InfoCard';
import { InfoField } from 'src/components/InfoField';
import { Loading } from 'src/components/Loading';
import { usePicoUnitContext } from 'src/contexts/PicoUnitContext';
import type { OptionalPicoUnitProps } from 'src/interfaces/optionalPicoUnit';
import { bytesToMB } from 'src/utils/methods';

export const PicoUnitTechnicalDetails: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;

  if (!pico) return <Loading />;

  const technical = useMemo(
    () => ({
      micropython_version: pico.micropython_version ?? '—',
      software_version: pico.software_version ?? '—',
      board: pico.board ?? '—',
      board_cpu_freq_mhz: pico.board_cpu_freq_mhz ?? '—',
      board_total_mem_mb: bytesToMB(pico.board_total_mem_byte ?? null),
      board_total_fs_mb: bytesToMB(pico.board_total_fs_byte ?? null),
    }),
    [pico],
  );

  return (
    <InfoCard title="Technical details" subtitle="Static board data" icon={<MemoryIcon />}>
      <InfoField label="Board">
        <BigDisplay content={technical.board} />
      </InfoField>
      <InfoField label="MicroPython version">
        <BigDisplay content={technical.micropython_version} />
      </InfoField>
      <InfoField label="Software version">
        <BigDisplay content={technical.software_version} />
      </InfoField>
    </InfoCard>
  );
};

import { Grid } from '@mui/material';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import type React from 'react';

import type { PicoUnit } from 'src/api/generated';

import { PicoUnitEditableInfo } from './PicoUnitEditableInfo';
import PicoUnitPracticalInfo from './PicoUnitPracticalInfo';
import PicoUnitTechnicalDetails from './PicoUnitTechnicalDetails';

interface PicoUnitDetailGridProps {
  pico: PicoUnit;
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<PicoUnit, unknown>>;
}

export const PicoUnitDetailGrid: React.FC<PicoUnitDetailGridProps> = ({ pico, refetch }) => (
  <Grid container spacing={2}>
    <Grid size={12}>
      <PicoUnitEditableInfo data={pico} refetch={refetch} />
    </Grid>
    <Grid size={6}>
      <PicoUnitTechnicalDetails pico={pico} />
    </Grid>
    <Grid size={6}>
      <PicoUnitPracticalInfo pico={pico} />
    </Grid>
  </Grid>
);

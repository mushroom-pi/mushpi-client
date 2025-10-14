import { Grid } from '@mui/material';
import type React from 'react';

import type { PicoUnit } from 'src/api/generated';

import { PicoUnitEditableInfo } from './PicoUnitEditableInfo';
import PicoUnitPracticalInfo from './PicoUnitPracticalInfo';
import PicoUnitTechnicalDetails from './PicoUnitTechnicalDetails';

interface PicoUnitDetailGridProps {
  pico: PicoUnit;
}

export const PicoUnitDetailGrid: React.FC<PicoUnitDetailGridProps> = ({ pico }) => (
  <Grid container spacing={2}>
    <Grid size={12}>
      <PicoUnitEditableInfo pico={pico} />
    </Grid>
    <Grid size={6}>
      <PicoUnitTechnicalDetails pico={pico} />
    </Grid>
    <Grid size={6}>
      <PicoUnitPracticalInfo pico={pico} />
    </Grid>
  </Grid>
);

import { Grid } from '@mui/material';
import type React from 'react';

import type { OptionalPicoUnitProps } from 'src/interfaces/optionalPicoUnit';

import { PicoUnitOverview as Overview } from './PicoUnitOverview';
import { PicoUnitPerformance as Performance } from './PicoUnitPerformance';
import { PicoUnitResources as Resources } from './PicoUnitResources';
import { PicoUnitTechnicalDetails as TechnicalDetails } from './PicoUnitTechnicalDetails';

export const PicoUnitDetailGrid: React.FC<OptionalPicoUnitProps> = () => (
  <Grid container spacing={2}>
    <Grid size={4}>
      <Overview />
    </Grid>
    <Grid size={8}>
      <TechnicalDetails />
    </Grid>
    <Grid size={6}>
      <Resources />
    </Grid>
    <Grid size={6}>
      <Performance />
    </Grid>
  </Grid>
);

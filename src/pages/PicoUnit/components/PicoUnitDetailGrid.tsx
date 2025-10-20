import { Grid } from '@mui/material';
import type React from 'react';

import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { PicoUnitControlsInfo as Controls } from './PicoUnitControlsInfo';
import { PicoUnitDevicesInfo as Devices } from './PicoUnitDevicesInfo';
import { PicoUnitMappingInfo as Mapping } from './PicoUnitMappingInfo';
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
    {[<Controls />, <Devices />, <Mapping />].map((comp) => (
      <Grid size={4}>{comp}</Grid>
    ))}
  </Grid>
);

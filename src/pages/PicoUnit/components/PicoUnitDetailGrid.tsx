import { Grid } from '@mui/material';
import type React from 'react';

import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';

import { PicoUnitControls as Controls } from './PicoUnitControls';
import { PicoUnitDevices as Devices } from './PicoUnitDevices';
import { PicoUnitMappingInfo as Mapping } from './PicoUnitMappingInfo';
import { PicoUnitOverview as Overview } from './PicoUnitOverview';
import { PicoUnitPerformance as Performance } from './PicoUnitPerformance';
import { PicoUnitResources as Resources } from './PicoUnitResources';
import { PicoUnitTechnicalDetails as TechnicalDetails } from './PicoUnitTechnicalDetails';

export const PicoUnitDetailGrid: React.FC<OptionalPicoUnitProps> = () => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 4 }}>
      <Overview />
    </Grid>
    <Grid size={{ xs: 12, md: 8 }}>
      <TechnicalDetails />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <Resources />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <Performance />
    </Grid>
    {[<Controls />, <Devices />, <Mapping />].map((comp, idx) => (
      <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
        {comp}
      </Grid>
    ))}
  </Grid>
);

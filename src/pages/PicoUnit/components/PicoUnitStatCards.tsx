import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import type React from 'react';

import type { PicoUnit } from '~api/generated';

interface PicoUnitStatCardsProps {
  pico?: PicoUnit;
  isPolling?: boolean;
}

export const PicoUnitStatCards: React.FC<PicoUnitStatCardsProps> = ({ pico, isPolling }) => {
  const reading = pico?.latest_reading;
  const temperature = reading?.temperature;
  const humidity = reading?.humidity;

  return (
    <Grid container spacing={2} mb={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <ThermostatIcon color="error" />
                <Typography variant="body2" color="text.secondary">
                  Temperature
                </Typography>
              </Box>
              {isPolling && <CircularProgress size={16} />}
            </Box>
            <Typography variant="h4" mt={1}>
              {temperature != null ? `${temperature}°C` : '--°C'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <WaterDropIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
              </Box>
              {isPolling && <CircularProgress size={16} />}
            </Box>
            <Typography variant="h4" mt={1}>
              {humidity != null ? `${humidity}%` : '--%'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

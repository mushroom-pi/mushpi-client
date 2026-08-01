import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Grid } from '@mui/material';
import type React from 'react';

import type { PicoUnit } from '~api/generated';
import { HUMIDITY_DEVIATION_THRESHOLD, TEMP_DEVIATION_THRESHOLD } from '~components';
import { isUnitHealthy, shouldShowRebootHint } from '~utils/pico';

import { MeasurementStatCard } from './MeasurementStatCard';

interface PicoUnitStatCardsProps {
  pico?: PicoUnit;
  isPolling?: boolean;
}

export const PicoUnitStatCards: React.FC<PicoUnitStatCardsProps> = ({ pico, isPolling }) => {
  const reading = pico?.latest_reading;
  const healthy = pico ? isUnitHealthy(pico) : true;
  const showRebootHint = pico ? shouldShowRebootHint(pico) : false;

  const temperature = reading?.temperature;
  const tempSet = reading?.temperature_set;
  const humidity = reading?.humidity;
  const humiditySet = reading?.humidity_set;
  const controlLoopEnabled = reading?.control_loop_enabled === true;

  // Temp deviation (only show when unit is healthy and control loop is on)
  const tempDeviationDiff =
    healthy &&
    controlLoopEnabled &&
    temperature != null &&
    tempSet != null &&
    Math.abs(temperature - tempSet) > TEMP_DEVIATION_THRESHOLD
      ? Math.abs(temperature - tempSet)
      : null;
  const tempDeviationDirection =
    tempDeviationDiff != null ? (temperature! > tempSet! ? 'above' : 'below') : null;

  // Humidity deviation (only show when unit is healthy and control loop is on)
  const humidityDeviationDiff =
    healthy &&
    controlLoopEnabled &&
    humidity != null &&
    humiditySet != null &&
    Math.abs(humidity - humiditySet) > HUMIDITY_DEVIATION_THRESHOLD
      ? Math.abs(humidity - humiditySet)
      : null;
  const humidityDeviationDirection =
    humidityDeviationDiff != null ? (humidity! > humiditySet! ? 'above' : 'below') : null;

  return (
    <Grid container spacing={2} mb={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MeasurementStatCard
          icon={<ThermostatIcon color="error" />}
          label="Temperature"
          currentValue={temperature}
          unit="°C"
          targetValue={tempSet}
          deviationDiff={tempDeviationDiff}
          deviationDirection={tempDeviationDirection}
          isPolling={isPolling}
          showRebootHint={showRebootHint}
          healthy={healthy}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MeasurementStatCard
          icon={<WaterDropIcon color="info" />}
          label="Humidity"
          currentValue={humidity}
          unit="%"
          targetValue={humiditySet}
          deviationDiff={humidityDeviationDiff}
          deviationDirection={humidityDeviationDirection}
          isPolling={isPolling}
          showRebootHint={showRebootHint}
          healthy={healthy}
        />
      </Grid>
    </Grid>
  );
};

import { Alert } from '@mui/material';
import type React from 'react';

export const TEMP_DEVIATION_THRESHOLD = 2;
export const HUMIDITY_DEVIATION_THRESHOLD = 10;

interface DeviationAlertProps {
  type: 'temp' | 'humidity';
  actualValue: number;
  targetValue: number;
  unit?: string;
  label?: string;
  variant?: 'standard' | 'filled';
}

export const DeviationAlert: React.FC<DeviationAlertProps> = ({
  type,
  actualValue,
  targetValue,
  unit,
  label,
  variant = 'standard',
}) => {
  const resolvedUnit = unit ?? (type === 'temp' ? '°C' : '%');
  const typeLabel = type === 'temp' ? 'temperature' : 'humidity';
  const diff = Math.abs(actualValue - targetValue);
  const direction = actualValue > targetValue ? 'above' : 'below';

  const message = label
    ? `${label}'s ${typeLabel} ${actualValue}${resolvedUnit} is ${diff}${resolvedUnit} ${direction} target ${targetValue}${resolvedUnit}`
    : `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} ${actualValue}${resolvedUnit} is ${diff}${resolvedUnit} ${direction} target ${targetValue}${resolvedUnit}`;

  return (
    <Alert severity="warning" variant={variant}>
      {message}
    </Alert>
  );
};

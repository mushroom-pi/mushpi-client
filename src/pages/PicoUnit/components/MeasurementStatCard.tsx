import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import { Box, Card, CardContent, CircularProgress, Tooltip, Typography } from '@mui/material';
import type React from 'react';

interface MeasurementStatCardProps {
  icon: React.ReactNode;
  label: string;
  currentValue: number | null | undefined;
  unit: string;
  targetValue?: number | null | undefined;
  deviationDiff?: number | null;
  deviationDirection?: 'above' | 'below' | null;
  isPolling?: boolean;
  showRebootHint?: boolean;
  healthy?: boolean;
}

export const MeasurementStatCard: React.FC<MeasurementStatCardProps> = ({
  icon,
  label,
  currentValue,
  unit,
  targetValue,
  deviationDiff,
  deviationDirection,
  isPolling,
  showRebootHint,
  healthy = true,
}) => {
  const displayValue =
    currentValue != null && healthy !== false ? `${currentValue}${unit}` : `--${unit}`;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
          {isPolling && <CircularProgress size={16} />}
        </Box>
        {showRebootHint ? (
          <Tooltip title="Some readings failed. Try rebooting the unit if this persists.">
            <Typography variant="h4" mt={1}>
              {displayValue}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="h4" mt={1}>
            {displayValue}
          </Typography>
        )}
        {targetValue != null && (
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Typography variant="body2" color="text.secondary">
              Target: {targetValue}
              {unit}
            </Typography>
            {deviationDiff != null && deviationDirection != null && (
              <>
                {deviationDirection === 'above' ? (
                  <ArrowUpward fontSize="small" sx={{ color: 'warning.main' }} />
                ) : (
                  <ArrowDownward fontSize="small" sx={{ color: 'warning.main' }} />
                )}
                <Typography variant="body2" sx={{ color: 'warning.main' }}>
                  {deviationDiff}
                  {unit} {deviationDirection}
                </Typography>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { Grid, Paper, Tooltip, Typography } from '@mui/material';

import { formatNumber } from '../methods';

interface StatsRowProps {
  units: number;
  paused: number;
  activeBatches: number;
  totalBatches: number;
  totalReadings: number;
}

export function StatsRow({
  units,
  paused,
  activeBatches,
  totalBatches,
  totalReadings,
}: StatsRowProps) {
  const stats = [
    {
      label: 'Enabled Units',
      value: units,
      tooltip: 'Enabled units only — disabled units are not shown.',
    },
    {
      label: 'Paused',
      value: paused,
      icon: <PauseCircleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />,
    },
    { label: 'Active Batches', value: activeBatches },
    { label: 'Total Batches', value: totalBatches },
    { label: 'Readings', value: totalReadings },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat) => (
        <Grid key={stat.label} size={{ xs: 6, sm: 2.4 }}>
          <Tooltip title={stat.tooltip ?? ''} arrow disableHoverListener={!stat.tooltip}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {formatNumber(stat.value)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
              >
                {stat.icon}
                {stat.label}
              </Typography>
            </Paper>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
}

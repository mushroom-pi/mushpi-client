import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardUnitItemDto } from '~api/generated';

import { formatLastSeen } from '../methods';

interface UnitCardsProps {
  items: DashboardUnitItemDto[];
  healthy: number;
  degraded: number;
  offline: number;
  total: number;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'offline') return <ErrorIcon color="error" fontSize="small" />;
  if (status === 'degraded') return <WarningIcon color="warning" fontSize="small" />;
  return <CheckCircleIcon color="success" fontSize="small" />;
}

export function UnitCards({ items, healthy, degraded, offline, total }: UnitCardsProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enabled Pico Units
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {healthy} healthy · {degraded} degraded · {offline} offline ({total} total) — disabled units not shown
      </Typography>

      <Grid container spacing={2}>
        {items.map((unit) => (
          <Grid key={unit.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={() => navigate(`/pico-units/${unit.id}`)}
            >
              <CardContent>
                {/* Header: health icon + name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <StatusIcon status={unit.status} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                      {unit.name ?? unit.handle}
                    </Typography>
                    {unit.name && (
                      <Typography variant="body2" color="text.secondary">
                        {unit.handle}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Readings row */}
                {unit.lastReading ? (
                  <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={500}>
                      {unit.lastReading.temperature != null
                        ? `${unit.lastReading.temperature}°C`
                        : '—'}
                    </Typography>
                    <Typography variant="h6" fontWeight={500} color="text.secondary">
                      {unit.lastReading.humidity != null ? `${unit.lastReading.humidity}%` : '—'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                    No readings yet
                  </Typography>
                )}

                {/* Status chips row */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {unit.lastReading && (
                    <Chip
                      label={unit.controlLoopEnabled ? 'Control loop ON' : 'Control loop OFF'}
                      size="small"
                      color={unit.controlLoopEnabled ? 'success' : 'default'}
                      variant="outlined"
                    />
                  )}
                  {unit.activeBatch && (
                    <Chip
                      label={unit.activeBatch.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {unit.activeBatch && (
                    <Chip
                      label={`${unit.activeBatch.daysRemaining}d left`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Footer: last seen */}
                <Typography variant="caption" color="text.secondary">
                  {formatLastSeen(unit.lastSeenSecondsAgo)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

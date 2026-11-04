import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardUnitItemDto } from '~api/generated';
import { FirmwareCompatBadge, UnitHealthIcon } from '~components';
import { compatibilityStatus } from '~utils/pico';

import { clipBatchDescription, formatLastSeen } from '../methods';

interface UnitCardsProps {
  items: DashboardUnitItemDto[];
  healthy: number;
  degraded: number;
  offline: number;
  total: number;
}

export function UnitCards({ items, healthy, degraded, offline, total }: UnitCardsProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Monitored Pico Units
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {healthy} healthy · {degraded} degraded · {offline} offline ({total} total) — paused units
        not shown
      </Typography>

      {/* CSS grid with `gridAutoRows: 1fr` so every card in every row stretches to the
          tallest one (MUI v7 `Grid` is flex-based; `height: 100%` there only equalizes
          within the wrapping row). Card fills its grid cell and is a column flexbox so
          the last-seen footer pins to the bottom. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          gridAutoRows: '1fr',
        }}
      >
        {items.map((unit) => (
          <Card
            key={unit.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
            }}
            onClick={() => navigate(`/pico-units/${unit.id}`)}
          >
            <CardContent sx={{ flex: 1 }}>
              {/* Header: health icon + name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <UnitHealthIcon status={unit.status} />
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
                {/* warning-only; the server exposes api_compatibility on dashboard items
                    (no api_version here, so the badge tooltip uses its generic copy) */}
                <FirmwareCompatBadge status={compatibilityStatus(unit)} />
                {unit.lastReading && (
                  <Chip
                    label={unit.controlLoopEnabled ? 'Control loop ON' : 'Control loop OFF'}
                    size="small"
                    color={unit.controlLoopEnabled ? 'success' : 'default'}
                    variant="outlined"
                  />
                )}
                {unit.activeBatch ? (
                  <>
                    <Chip
                      label={clipBatchDescription(unit.activeBatch.name)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ '& .MuiChip-label': { whiteSpace: 'nowrap' } }}
                    />
                    <Chip
                      label={`${unit.activeBatch.daysRemaining}d left`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </>
                ) : (
                  <Chip label="No active batch" size="small" color="info" variant="outlined" />
                )}
              </Box>

              {/* Footer: last seen */}
              <Typography variant="caption" color="text.secondary">
                {formatLastSeen(unit.lastSeenSecondsAgo)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

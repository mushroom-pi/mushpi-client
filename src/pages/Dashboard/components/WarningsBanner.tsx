import { Alert, Stack } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { DashboardWarningDto } from '~api/generated';

interface WarningsBannerProps {
  warnings: DashboardWarningDto[];
  unitNames?: Map<number, string>;
}

export function WarningsBanner({ warnings, unitNames }: WarningsBannerProps) {
  const navigate = useNavigate();

  const consolidated = useMemo(() => {
    const offlineWarnings = warnings.filter((w) => w.type === 'unit_offline');
    const offlineUnitIds = new Set(offlineWarnings.map((w) => w.unitId));

    // Deduplicate offline unit names (keep first occurrence per unitId)
    const seenOffline = new Set<number>();
    const offlineNames: string[] = [];
    for (const w of offlineWarnings) {
      if (!seenOffline.has(w.unitId)) {
        seenOffline.add(w.unitId);
        offlineNames.push(unitNames?.get(w.unitId) ?? w.handle);
      }
    }

    // Deviation warnings: exclude units that are offline
    const deviatingWarnings = warnings.filter(
      (w) =>
        (w.type === 'temp_deviation' || w.type === 'humidity_deviation') &&
        !offlineUnitIds.has(w.unitId),
    );
    const deviatingUnitIds = new Set(deviatingWarnings.map((w) => w.unitId));
    const deviationCount = deviatingUnitIds.size;

    // Other warnings: unit_degraded, empty_readings — keep individual
    const otherWarnings = warnings.filter(
      (w) => w.type === 'unit_degraded' || w.type === 'empty_readings',
    );

    return { offlineNames, deviationCount, otherWarnings };
  }, [warnings, unitNames]);

  if (
    consolidated.offlineNames.length === 0 &&
    consolidated.deviationCount === 0 &&
    consolidated.otherWarnings.length === 0
  ) {
    return null;
  }

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {consolidated.offlineNames.length > 0 && (
        <Alert
          key="offline"
          severity="error"
          variant="filled"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/pico-units')}
        >
          {consolidated.offlineNames.length === 1
            ? `${consolidated.offlineNames[0]} is unreachable`
            : `${consolidated.offlineNames.join(', ')} are unreachable`}
        </Alert>
      )}
      {consolidated.deviationCount > 0 && (
        <Alert
          key="deviations"
          severity="warning"
          variant="filled"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/pico-units')}
        >
          {consolidated.deviationCount === 1
            ? '1 unit shows readings apart from its targets and needs your attention'
            : `${consolidated.deviationCount} units show readings apart from their targets and need your attention`}
        </Alert>
      )}
      {consolidated.otherWarnings.map((warning, idx) => {
        const unitName = unitNames?.get(warning.unitId) ?? warning.handle;
        return (
          <Alert
            key={`${warning.type}-${warning.unitId}-${idx}`}
            severity={warning.severity}
            variant="filled"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/pico-units/${warning.unitId}`)}
          >
            {unitName}: {warning.message}
          </Alert>
        );
      })}
    </Stack>
  );
}

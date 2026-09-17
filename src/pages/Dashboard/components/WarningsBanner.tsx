import { Alert, Stack } from '@mui/material';
import { type KeyboardEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { type DashboardWarningDto, DashboardWarningDtoTypeEnum } from '~api/generated';

interface WarningsBannerProps {
  warnings: DashboardWarningDto[];
  unitNames?: Map<number, string>;
}

/** How the banner presents a warning: consolidated offline line, deviation counter, or one alert each. */
type WarningGroup = 'offline' | 'deviation' | 'individual';

/**
 * Every warning type the server can emit must declare its banner treatment here.
 * `Record<DashboardWarningDtoTypeEnum, WarningGroup>` is exhaustiveness-checked: if the
 * server adds a warning type and the client regenerates, the missing key is a `tsc`
 * error — a new type can never be silently dropped by the banner.
 */
const WARNING_GROUPS: Record<DashboardWarningDtoTypeEnum, WarningGroup> = {
  [DashboardWarningDtoTypeEnum.UnitOffline]: 'offline',
  [DashboardWarningDtoTypeEnum.TempDeviation]: 'deviation',
  [DashboardWarningDtoTypeEnum.HumidityDeviation]: 'deviation',
  [DashboardWarningDtoTypeEnum.UnitDegraded]: 'individual',
  [DashboardWarningDtoTypeEnum.EmptyReadings]: 'individual',
};

function handleAlertKeyDown(e: KeyboardEvent<HTMLDivElement>, navigate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navigate();
  }
}

export function WarningsBanner({ warnings, unitNames }: WarningsBannerProps) {
  const navigate = useNavigate();

  const consolidated = useMemo(() => {
    const offlineWarnings = warnings.filter((w) => WARNING_GROUPS[w.type] === 'offline');
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
      (w) => WARNING_GROUPS[w.type] === 'deviation' && !offlineUnitIds.has(w.unitId),
    );
    const deviatingUnitIds = new Set(deviatingWarnings.map((w) => w.unitId));
    const deviationCount = deviatingUnitIds.size;

    // Catch-all bucket: the 'individual' types above, PLUS anything this client's
    // generated contract predates (unknown type → group lookup misses → rendered as
    // its own generic alert instead of vanishing from the banner).
    const otherWarnings = warnings.filter(
      (w) => WARNING_GROUPS[w.type] !== 'offline' && WARNING_GROUPS[w.type] !== 'deviation',
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
          role="button"
          tabIndex={0}
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/pico-units')}
          onKeyDown={(e) => handleAlertKeyDown(e, () => navigate('/pico-units'))}
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
          role="button"
          tabIndex={0}
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/pico-units')}
          onKeyDown={(e) => handleAlertKeyDown(e, () => navigate('/pico-units'))}
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
            role="button"
            tabIndex={0}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/pico-units/${warning.unitId}`)}
            onKeyDown={(e) =>
              handleAlertKeyDown(e, () => navigate(`/pico-units/${warning.unitId}`))
            }
          >
            {unitName}: {warning.message}
          </Alert>
        );
      })}
    </Stack>
  );
}

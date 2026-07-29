import { Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DashboardWarningDto } from '~api/generated';
import { DeviationAlert } from '~components';

interface WarningsBannerProps {
  warnings: DashboardWarningDto[];
  unitNames?: Map<number, string>;
}

export function WarningsBanner({ warnings, unitNames }: WarningsBannerProps) {
  const navigate = useNavigate();

  if (warnings.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {warnings.map((warning, index) => {
        const key = `${warning.type}-${warning.unitId}-${index}`;
        const onClick = () => navigate(`/pico-units/${warning.unitId}`);

        if (
          (warning.type === 'temp_deviation' || warning.type === 'humidity_deviation') &&
          warning.reading
        ) {
          const unitName = unitNames?.get(warning.unitId) ?? warning.handle;
          return (
            <DeviationAlert
              key={key}
              type={warning.type === 'temp_deviation' ? 'temp' : 'humidity'}
              actualValue={warning.reading.value}
              targetValue={warning.reading.target}
              label={unitName}
              variant="filled"
            />
          );
        }

        const unitName = unitNames?.get(warning.unitId) ?? warning.handle;
        return (
          <Alert
            key={key}
            severity={warning.severity}
            variant="filled"
            sx={{ cursor: 'pointer' }}
            onClick={onClick}
          >
            {unitName}: {warning.message}
          </Alert>
        );
      })}
    </Stack>
  );
}

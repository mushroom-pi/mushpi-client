import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import { Chip, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import type { HealthCheckResponseDto as ServerHealth } from '~api/generated';
import { BigDisplay, InfoCard, InfoField } from '~components';

function formatTableSize(sizeMb: number | null, rowCount?: number): string {
  if (sizeMb != null) {
    return sizeMb < 0.01 ? `${(sizeMb * 1024).toFixed(1)} KB` : `${sizeMb.toFixed(2)} MB`;
  }
  return `${(rowCount ?? 0).toLocaleString()} rows`;
}

interface ServerDatabaseCardProps {
  serverHealth: ServerHealth;
}

export const ServerDatabaseCard: FC<ServerDatabaseCardProps> = ({ serverHealth }) => (
  <InfoCard title="Database" subtitle="SQLite storage" icon={<LayersIcon />}>
    <InfoField label="Total size">
      {serverHealth.databases?.sqlite?.size?.totalMb != null ? (
        <BigDisplay content={`${serverHealth.databases.sqlite.size.totalMb.toFixed(2)} MB`} />
      ) : (
        <BigDisplay content="In-memory" />
      )}
    </InfoField>
    <Stack direction="row" spacing={1} mt={0.5} mb={1}>
      <Chip
        icon={serverHealth.databases?.sqlite?.read ? <CheckIcon /> : <CloseIcon />}
        label={serverHealth.databases?.sqlite?.read ? 'Read OK' : 'Read failed'}
        size="small"
        color={serverHealth.databases?.sqlite?.read ? 'success' : 'error'}
        variant="outlined"
      />
      <Chip
        icon={serverHealth.databases?.sqlite?.write ? <CheckIcon /> : <CloseIcon />}
        label={serverHealth.databases?.sqlite?.write ? 'Write OK' : 'Write failed'}
        size="small"
        color={serverHealth.databases?.sqlite?.write ? 'success' : 'error'}
        variant="outlined"
      />
    </Stack>
    {serverHealth.databases?.sqlite?.size?.path && (
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {serverHealth.databases.sqlite.size.path}
      </Typography>
    )}
    {serverHealth.databases?.sqlite?.size?.tables &&
      serverHealth.databases.sqlite.size.tables.length > 0 && (
        <>
          <Typography variant="overline" color="text.secondary">
            Top tables
          </Typography>
          {serverHealth.databases.sqlite.size.tables.slice(0, 6).map((table) => (
            <Stack
              key={table.name}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" noWrap>
                {table.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTableSize(table.sizeMb, table.rowCount)}
              </Typography>
            </Stack>
          ))}
          {serverHealth.databases.sqlite.size.overheadMb != null &&
            serverHealth.databases.sqlite.size.overheadMb > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography variant="body2" noWrap color="text.secondary">
                  Overhead (WAL, free pages)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {serverHealth.databases.sqlite.size.overheadMb.toFixed(2)} MB
                </Typography>
              </Stack>
            )}
        </>
      )}
  </InfoCard>
);

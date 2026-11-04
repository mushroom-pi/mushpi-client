import MemoryIcon from '@mui/icons-material/Memory';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { BigDisplay, FirmwareCompatBadge, InfoCard, InfoField, Loading } from '~components';
import { usePicoUnitContext } from '~ctx/PicoUnit';
import type { OptionalPicoUnitProps } from '~int/optionalPicoUnit';
import { bytesToMB } from '~utils/methods';
import { FIRMWARE_UNKNOWN, compatibilityStatus, firmwareStatus } from '~utils/pico';

const API_VERSION_TOOLTIP =
  'The Pico↔Server REST API-contract generation this unit speaks. ' +
  'It is bumped only when the Pico REST API changes in a breaking way — ' +
  "it is NOT the server's /v1/ URL prefix (those are independent version axes).";

export const PicoUnitTechnicalDetails: React.FC<OptionalPicoUnitProps> = ({ pico: dataProp }) => {
  const ctx = usePicoUnitContext();
  const pico = dataProp ?? ctx.pico;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  if (!pico) return <Loading />;

  const technical = useMemo(
    () => ({
      micropython_version: pico.micropython_version ?? '—',
      firmware: firmwareStatus(pico),
      board: pico.board ?? '—',
      board_cpu_freq_mhz: pico.board_cpu_freq_mhz ?? '—',
      board_total_mem_mb: bytesToMB(pico.board_total_mem_byte ?? null),
      board_total_fs_mb: bytesToMB(pico.board_total_fs_byte ?? null),
    }),
    [pico],
  );

  const { firmware, apiGeneration } = technical.firmware;
  // Server-owned verdict — plain read (not a hook) so it stays below the existing early return.
  const compatibility = compatibilityStatus(pico);

  return (
    <InfoCard title="Technical details" subtitle="Static board data" icon={<MemoryIcon />}>
      <InfoField label="Board">
        <BigDisplay content={technical.board} />
      </InfoField>
      <InfoField label="MicroPython version">
        <BigDisplay content={technical.micropython_version} />
      </InfoField>
      <Grid container spacing={2}>
        <Grid size={isSmallScreen ? 6 : 3}>
          <InfoField label="Firmware version">
            {firmware !== FIRMWARE_UNKNOWN ? (
              <BigDisplay content={firmware} />
            ) : (
              <Typography variant="body2" color="text.disabled">
                This unit hasn&apos;t reported its firmware version yet — it likely runs
                pre-versioning firmware.
              </Typography>
            )}
          </InfoField>
        </Grid>
        <Grid size={isSmallScreen ? 6 : 3}>
          <InfoField label="API version" tooltip={API_VERSION_TOOLTIP}>
            {apiGeneration !== FIRMWARE_UNKNOWN ? (
              /* bare integer on purpose — no `v` prefix, so it can't be misread as SemVer */
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <BigDisplay content={apiGeneration} />
                {/* warning-only; renders nothing unless the server flags the unit incompatible */}
                <FirmwareCompatBadge status={compatibility} apiVersion={pico.api_version} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled">
                This unit hasn&apos;t reported its API version yet — it likely runs pre-versioning
                firmware.
              </Typography>
            )}
          </InfoField>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

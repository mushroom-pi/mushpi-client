import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Card, CardContent, IconButton, List, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { type PicoUnit } from 'src/api/generated';
import { FieldRow } from 'src/components/FieldRow';
import { bytesToMB } from 'src/utils/methods';

export default function PicoUnitTechnicalDetails({ pico }: { pico: PicoUnit }) {
  const [isOpen, setIsOpen] = useState(false);

  const technical = useMemo(
    () => ({
      micropython_version: pico.micropython_version ?? '—',
      software_version: pico.software_version ?? '—',
      board: pico.board ?? '—',
      board_cpu_freq_mhz: pico.board_cpu_freq_mhz ?? '—',
      board_total_mem_mb: bytesToMB(pico.board_total_mem_byte ?? null),
      board_total_fs_mb: bytesToMB(pico.board_total_fs_byte ?? null),
    }),
    [pico],
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Technical Details</Typography>
          <Tooltip title={isOpen ? 'Collapse' : 'Expand'}>
            <IconButton onClick={() => setIsOpen((s) => !s)} size="small">
              <ExpandMoreIcon
                sx={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform .2s',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <List>
          <FieldRow label="MicroPython version" value={technical.micropython_version} />
          <FieldRow label="Software version" value={technical.software_version} />
          {isOpen && (
            <>
              <FieldRow label="Board" value={technical.board} />
              <FieldRow label="Board CPU freq (MHz)" value={technical.board_cpu_freq_mhz} />
              <FieldRow label="Board RAM (MB)" value={technical.board_total_mem_mb} />
              <FieldRow label="Board filesystem memory (MB)" value={technical.board_total_fs_mb} />
            </>
          )}
        </List>
      </CardContent>
    </Card>
  );
}

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { PicoUnit } from 'src/api/generated';
import { FieldRow } from 'src/components/FieldRow';

export default function PicoUnitPracticalInfo({ pico }: { pico: PicoUnit }) {
  const [isOpen, setIsOpen] = useState(false);

  const prettyDate = (ts?: string) => (ts ? new Date(ts).toLocaleString() : '—');

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Practical info</Typography>
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
          <FieldRow label="Handle" value={pico.handle} />
          <FieldRow label="Last seen" value={prettyDate(pico.last_seen)} />
          {isOpen && (
            <>
              <Divider sx={{ my: 1 }} />
              <FieldRow
                label="Host:Port"
                value={`${pico.host ?? '—'}${pico.port ? `:${pico.port}` : ''}`}
              />
              <FieldRow label="Created at" value={prettyDate(pico.created_at)} />
              <FieldRow label="ID" value={pico.id} />
            </>
          )}
        </List>
      </CardContent>
    </Card>
  );
}

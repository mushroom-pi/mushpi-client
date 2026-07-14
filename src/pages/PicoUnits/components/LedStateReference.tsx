import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { LED_STATES } from './provisioning';

interface LedStateReferenceProps {
  compact?: boolean;
}

export function LedStateReference({ compact = false }: LedStateReferenceProps) {
  return (
    <Accordion
      sx={
        compact
          ? {
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
            }
          : undefined
      }
    >
      <AccordionSummary sx={compact ? { minHeight: 36, py: 0 } : undefined}>
        <Typography variant={compact ? 'caption' : 'subtitle2'} color="text.secondary">
          {compact ? 'Not sure about the LED? Tap here' : 'LED Status Reference'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={compact ? { pt: 0, pb: 1 } : undefined}>
        <Stack spacing={compact ? 0.5 : 1}>
          {LED_STATES.map((item) => (
            <Stack key={item.id} direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: compact ? 8 : 10,
                  height: compact ? 8 : 10,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  display: 'inline-block',
                  mr: 1,
                  flexShrink: 0,
                }}
              />
              <Typography variant={compact ? 'caption' : 'body2'}>
                <strong>{item.label}</strong> — {item.meaning}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { HeaderAndIcon, LedStateReference, JoinWifiIllustration, OpenBrowserIllustration, SuccessIllustration } from '~components';
import { apSsidOrFallback, LED_STATES, POLL_FINISH_MAX_ATTEMPTS, PROVISION_AP_URL } from '~utils/pico';

import type { ReconnectPicoDialogProps } from './interfaces';
import { useReconnectPoll } from './useReconnectPoll';

const STEPS = ['Diagnose', 'Connect', 'Setup', 'Finish'];

const ACCENT_COLOR = '#C66F2F';

/** Diagnostic card for step 0 */
function DiagnosticCard({
  color,
  label,
  meaning,
  action,
}: {
  color: string;
  label: string;
  meaning: string;
  action?: React.ReactNode;
}) {
  return (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderLeft: 4,
        borderLeftColor: color,
        p: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
          mr: 2,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {meaning}
        </Typography>
      </Box>
      {action && <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>}
    </Paper>
  );
}

/** Inline LED transition diagram for the Finish step */
function LedTransitionDiagram() {
  const off = LED_STATES.find((s) => s.id === 'off')!;
  const solid = LED_STATES.find((s) => s.id === 'solid')!;
  const heartbeat = LED_STATES.find((s) => s.id === 'heartbeat')!;
  const stages = [
    { color: off.color, label: 'OFF' },
    { color: solid.color, label: 'Solid' },
    { color: heartbeat.color, label: 'Heartbeat' },
  ];
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
      {stages.map((s, i) => (
        <Stack key={s.label} direction="row" alignItems="center" spacing={0.5}>
          {i > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
              →
            </Typography>
          )}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: s.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {s.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function ReconnectPicoDialog({ pico, onClose }: ReconnectPicoDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { waiting, recovered, attempt, timedOut, reset: resetPoll } = useReconnectPoll(
    activeStep === STEPS.length - 1 ? pico?.id : undefined,
  );
  const { ssid, exact } = apSsidOrFallback(pico?.mac);

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (pico != null) {
      setActiveStep(0);
    }
  }, [pico]);

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      onClose();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const title = pico ? `Reconnect ${pico.name || pico.handle}` : 'Reconnect';

  const isLastStep = activeStep === STEPS.length - 1;

  // --- Step content renderers ---

  const diagnoseContent = (
    <Stack spacing={2} width="100%">
      <Typography variant="body1" textAlign="center">
        What does your Pico&apos;s LED look like?
      </Typography>
      {LED_STATES.map((state) => {
        let action: React.ReactNode = undefined;
        let meaning: string = state.meaning;

        if (state.id === 'provisioning') {
          meaning = 'Provisioning mode. The Pico is waiting for Wi‑Fi credentials. Continue to reconnect.';
          action = (
            <Button size="small" variant="contained" onClick={() => setActiveStep(1)}>
              Next →
            </Button>
          );
        } else if (state.id === 'solid') {
          meaning =
            'This unit is already registered. If the LED is solid but the unit appears offline, the hub URL on the Pico may be wrong. Check the Pico\'s config.json.';
        } else if (state.id === 'off') {
          meaning = 'No power or still booting. Wait 30 seconds and check again.';
        } else if (state.id === 'heartbeat') {
          meaning = 'Already connected to the hub! The unit should be online.';
        }

        return (
          <DiagnosticCard
            key={state.id}
            color={state.color}
            label={state.label}
            meaning={meaning}
            action={action}
          />
        );
      })}
    </Stack>
  );

  const connectContent = (
    <>
      <JoinWifiIllustration />
      <Typography variant="body1" textAlign="center">
        {exact ? (
          <>
            Join the Wi-Fi network:{' '}
            <Typography component="span" fontWeight="bold" sx={{ color: ACCENT_COLOR }}>
              {ssid}
            </Typography>
          </>
        ) : (
          <>
            On your phone or laptop, look for a Wi-Fi network starting with &apos;mushpi-provision&apos;{' '}
            and join it.
          </>
        )}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        The network is open — no password needed.
      </Typography>
    </>
  );

  const setupContent = (
    <>
      <OpenBrowserIllustration />
      <Typography variant="body1" textAlign="center">
        Open{' '}
        <Link href={PROVISION_AP_URL} target="_blank" rel="noopener noreferrer">
          {PROVISION_AP_URL}
        </Link>{' '}
        in your browser.
      </Typography>
    </>
  );

  const finishContent = (
    <>
      <SuccessIllustration />
      {waiting && !recovered && !timedOut && (
        <Stack spacing={1} alignItems="center" width="100%">
          <LinearProgress
            variant="determinate"
            value={(attempt / POLL_FINISH_MAX_ATTEMPTS) * 100}
            sx={{ width: '100%' }}
          />
          <Typography variant="body2" color="text.secondary">
            Attempt {attempt + 1} of {POLL_FINISH_MAX_ATTEMPTS}…
          </Typography>
        </Stack>
      )}
      {recovered && (
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="body2" color="success.main">
            Pico is back online!
          </Typography>
        </Box>
      )}
      {timedOut && (
        <Stack spacing={1.5} alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon color="warning" fontSize="small" />
            <Typography variant="body2" color="warning.main">
              We couldn&apos;t reach your Pico.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            If LED is Solid ON, the hub URL may be wrong.
          </Typography>
          <Button onClick={resetPoll}>Try Again</Button>
        </Stack>
      )}
      <Typography variant="body2" color="text.secondary" textAlign="center">
        After provisioning, the LED should go:
      </Typography>
      <LedTransitionDiagram />
    </>
  );

  const stepContents = [diagnoseContent, connectContent, setupContent, finishContent];

  return (
    <Dialog open={pico != null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <HeaderAndIcon title={title} />
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 1 }}>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} alignItems="center" mt={1}>
          {stepContents[activeStep]}
        </Stack>
        <Box mt={2}>
          <LedStateReference compact />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 1.5 }}>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          {isLastStep ? 'Done' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

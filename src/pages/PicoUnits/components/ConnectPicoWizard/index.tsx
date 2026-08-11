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
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { PicoUnitListResponseDto } from '~api/generated';
import { picoUnitsKeys } from '~api/queryKeys';
import { HeaderAndIcon, LedStateReference, JoinWifiIllustration, OpenBrowserIllustration, SuccessIllustration } from '~components';
import { LED_STATES, POLL_FINISH_MAX_ATTEMPTS, PROVISION_AP_URL } from '~utils/pico';

import { ManualRegisterDialog } from '../ManualRegisterDialog';
import type { ConnectPicoWizardProps } from './interfaces';
import { useNewPicoPoll } from './useNewPicoPoll';

const STEPS = ['Diagnose', 'Connect', 'Setup', 'Finish'];

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

export function ConnectPicoWizard({ open, onClose }: ConnectPicoWizardProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [resolvedUnitId, setResolvedUnitId] = useState<number | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  // Capture baseline IDs when dialog opens
  const baselineIds = useMemo(() => {
    if (!open) return null;
    const cached = qc.getQueryData(picoUnitsKeys.list({ page: 1, limit: 100 }));
    if (cached && typeof cached === 'object' && 'items' in cached) {
      return (cached as PicoUnitListResponseDto).items.map((u) => u.id);
    }
    return [];
    // Only recompute when dialog opens
  }, [open]);

  const { newUnit, detected, attempt, timedOut, reset: resetPoll } = useNewPicoPoll(baselineIds, {
    enabled: open && activeStep === STEPS.length - 1,
  });

  // On detection: capture resolved unit ID
  useEffect(() => {
    if (detected && newUnit) {
      setResolvedUnitId(newUnit.id);
    }
  }, [detected, newUnit]);

  // Reset step and resolvedUnitId when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setResolvedUnitId(null);
    }
  }, [open]);

  const handleClose = () => {
    if (resolvedUnitId != null) {
      navigate(`/pico-units/${resolvedUnitId}`, { state: { openEditDialog: true } });
    }
    onClose();
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 1) {
      handleClose();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

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
          meaning = 'Provisioning mode. The Pico is waiting for Wi‑Fi credentials. Continue the setup below.';
          action = (
            <Button size="small" variant="contained" onClick={() => setActiveStep(1)}>
              Next →
            </Button>
          );
        } else if (state.id === 'solid') {
          meaning = "Connected to Wi‑Fi, but can't reach the hub. The hub URL may be wrong. Try registering manually.";
          action = (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => setManualOpen(true)}
            >
              Register Manually
            </Button>
          );
        } else if (state.id === 'off') {
          meaning = 'No power or still booting. Wait 30 seconds and check again.';
        } else if (state.id === 'heartbeat') {
          meaning = 'Already connected to the hub! Check your dashboard.';
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
        On your phone or laptop, look for a Wi-Fi network starting with &apos;mushpi-provision&apos;{' '}
        in your list and join it.
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
      {!detected && !timedOut && (
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
      {detected && newUnit && (
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="body2" color="success.main">
            Detected: {newUnit.name || newUnit.handle}
          </Typography>
        </Box>
      )}
      {timedOut && (
        <Stack spacing={1.5} alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon color="warning" fontSize="small" />
            <Typography variant="body2" color="warning.main">
              We couldn&apos;t detect your Pico automatically.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            If LED is Solid ON, the hub URL may be wrong.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={resetPoll}>Try Again</Button>
            <Button color="warning" variant="outlined" onClick={() => setManualOpen(true)}>
              Register Manually
            </Button>
          </Stack>
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
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <HeaderAndIcon title="Connect a New Pico" />
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
      <ManualRegisterDialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSuccess={(unit) => {
          setResolvedUnitId(unit.id);
          setManualOpen(false);
        }}
      />
    </>
  );
}

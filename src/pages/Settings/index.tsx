import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { schemas } from '~api/generated/schemas';
import { Error, PageTitle } from '~components';
import { useToast } from '~ctx/Toast';
import { useDemoMode } from '~hook/useDemoMode';
import { useDisplayTimezone } from '~hook/useDisplayTimezone';
import { useDocumentTitle } from '~hook/useDocumentTitle';
import { useSettings, useUpdateSettings } from '~hook/useSettings';
import { Page } from '~layout/Page';

import { SettingsSkeleton } from './components/SettingsSkeleton';

export const Settings = () => {
  useDocumentTitle('Settings');
  const { data, isLoading, isError, error, refetch } = useSettings();
  const update = useUpdateSettings();
  const { isDemo } = useDemoMode();
  const { timezone, isOverridden, setTimezone } = useDisplayTimezone();
  const toast = useToast();

  const [selected, setSelected] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Demo hub: the effective setting is the stored override when present (the
  // store honors it only on demo hubs). Non-demo hub: the server-persisted
  // value — exactly the original derivation.
  const baseline = isDemo ? (isOverridden ? timezone : '') : (data?.timezone ?? '');

  useEffect(() => {
    if (isDirty) return;
    if (isDemo && isOverridden) {
      setSelected(timezone);
    } else if (data?.timezone) {
      setSelected(data.timezone);
    }
  }, [data?.timezone, isDirty, isDemo, isOverridden, timezone]);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone') as string[];
    } catch {
      return [];
    }
  }, []);

  const errors = useMemo(() => {
    if (!selected) return { timezone: 'Timezone is required' };
    const r = schemas.UpdateSettingsDto.safeParse({ timezone: selected });
    if (r.success) return {};
    return Object.fromEntries(
      r.error.issues.map((i) => [i.path[0] ?? 'timezone', i.message]),
    ) as Record<string, string>;
  }, [selected]);

  const canSave = !!selected && selected !== baseline && !Object.values(errors).some(Boolean);

  const handleSave = () => {
    if (!canSave) return;
    if (isDemo) {
      // Per-browser save: no request is issued at all, so nothing can be
      // refused and no server message can appear.
      setTimezone(selected!);
      toast.success('Timezone updated');
      return;
    }
    update.mutate(selected!);
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = <SettingsSkeleton />;
  } else if (isError) {
    content = <Error compact item="settings" error={error} refetch={refetch} />;
  } else {
    content = (
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">Display Timezone</Typography>
                <Typography variant="body2" color="text.secondary">
                  Controls how timestamps are displayed across the dashboard.
                </Typography>
              </Box>
              <Autocomplete
                options={timezones}
                groupBy={(tz) => tz.split('/')[0]}
                value={selected}
                onChange={(_, v) => {
                  setIsDirty(true);
                  setSelected(v ?? '');
                }}
                freeSolo={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Timezone"
                    error={!!errors.timezone}
                    helperText={errors.timezone ?? 'Search by region or city'}
                  />
                )}
              />
              <Button
                variant="contained"
                disabled={!canSave}
                loading={update.isPending}
                onClick={handleSave}
              >
                Save
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Page>
      <PageTitle>Settings</PageTitle>
      {content}
    </Page>
  );
};

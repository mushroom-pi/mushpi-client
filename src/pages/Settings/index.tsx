import { Autocomplete, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';

import { schemas } from '~api/generated/schemas';
import { Error, PageTitle } from '~components';
import { useSettings, useUpdateSettings } from '~hook/useSettings';
import { Page } from '~layout/Page';

import { SettingsSkeleton } from './components/SettingsSkeleton';

export const Settings = () => {
  const { data, isLoading, isError, error, refetch } = useSettings();
  const update = useUpdateSettings();

  const [selected, setSelected] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.timezone && !isDirty) {
      setSelected(data.timezone);
    }
  }, [data?.timezone, isDirty]);

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

  const canSave =
    !!selected &&
    selected !== (data?.timezone ?? '') &&
    !Object.values(errors).some(Boolean);

  const handleSave = () => {
    if (!canSave) return;
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

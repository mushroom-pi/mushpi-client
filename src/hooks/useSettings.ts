import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrap } from '~api/adapter';
import { Settings } from '~api/client';
import type { SettingsResponseDto } from '~api/generated';
import { settingsKeys } from '~api/queryKeys';
import { useToast } from '~ctx/Toast';

function extractMessage(err: unknown, fallback = 'Failed to update settings'): string {
  try {
    if (!err) return fallback;
    const anyErr = err as any;
    if (anyErr?.response?.data?.message) return String(anyErr.response.data.message);
    if (err instanceof Error && err.message) return err.message;
    if (anyErr?.response?.data) return JSON.stringify(anyErr.response.data);
    if (anyErr?.message) return String(anyErr.message);
    if (typeof err === 'string') return err;
    return fallback;
  } catch {
    return fallback;
  }
}

export const useSettings = () =>
  useQuery<SettingsResponseDto, unknown, SettingsResponseDto>({
    queryKey: settingsKeys.all,
    queryFn: async () => {
      const res = await unwrap(Settings.settingsControllerGetSettingsV1());
      return res as unknown as SettingsResponseDto;
    },
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation<SettingsResponseDto, unknown, string>({
    mutationFn: async (timezone: string) => {
      const res = await unwrap(
        Settings.settingsControllerUpdateSettingsV1({ updateSettingsDto: { timezone } }),
      );
      return res as unknown as SettingsResponseDto;
    },
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.all, data);
      qc.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Timezone updated');
    },
    onError: (err) => {
      toast.error(extractMessage(err));
    },
  });
};

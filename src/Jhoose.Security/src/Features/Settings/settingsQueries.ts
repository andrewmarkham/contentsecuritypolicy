import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage, requestJson } from '../../lib/requestJson';
import { SecuritySettings } from '../Csp/Types/types';

const settingsQueryKey = ['settings'];

export { getErrorMessage };

async function fetchSettings(): Promise<SecuritySettings> {
  return requestJson<SecuritySettings>('/api/jhoose/settings');
}

async function updateSettings(settings: SecuritySettings): Promise<SecuritySettings> {
  return requestJson<SecuritySettings>('/api/jhoose/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
    staleTime: 30000,
    retry: 1,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKey, data);
    },
  });
}

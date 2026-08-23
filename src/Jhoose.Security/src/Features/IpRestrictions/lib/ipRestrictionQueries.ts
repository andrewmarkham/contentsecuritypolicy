import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, requestJson } from '../../../lib/requestJson';
import { BulkIpRestrictionResult, IpRestrictionEntry } from '../Types/IpRestrictionEntry';

const ipRestrictionsQueryKey = ['iprestrictions'];

async function fetchIpRestrictions(): Promise<IpRestrictionEntry[]> {
  return requestJson<IpRestrictionEntry[]>('/api/jhoose/iprestrictions');
}

async function addIpRestrictions(site: string, values: string[]): Promise<BulkIpRestrictionResult> {
  return requestJson<BulkIpRestrictionResult>('/api/jhoose/iprestrictions/bulk', {
    method: 'POST',
    body: JSON.stringify({ site, values }),
  });
}

async function deleteIpRestriction(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/iprestrictions/${id}`, {
    method: 'DELETE',
  });
}

export function useIpRestrictionsQuery() {
  return useQuery({
    queryKey: ipRestrictionsQueryKey,
    queryFn: fetchIpRestrictions,
    staleTime: 30000,
    retry: 1,
  });
}

export function useAddIpRestrictionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ site, values }: { site: string; values: string[] }) => addIpRestrictions(site, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipRestrictionsQueryKey });
    },
  });
}

export function useDeleteIpRestrictionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIpRestriction,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<IpRestrictionEntry[]>(ipRestrictionsQueryKey, (current) =>
        current ? current.filter((entry) => entry.id !== id) : current
      );
    },
  });
}

export { getErrorMessage };

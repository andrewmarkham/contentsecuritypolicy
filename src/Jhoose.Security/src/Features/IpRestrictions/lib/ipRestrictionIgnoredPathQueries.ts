import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, requestJson } from '../../../lib/requestJson';
import { BulkIpRestrictionIgnoredPathResult, IpRestrictionIgnoredPath } from '../Types/IpRestrictionIgnoredPath';

const ipRestrictionIgnoredPathsQueryKey = ['ipignoredpaths'];

async function fetchIpRestrictionIgnoredPaths(): Promise<IpRestrictionIgnoredPath[]> {
  return requestJson<IpRestrictionIgnoredPath[]>('/api/jhoose/ipignoredpaths');
}

async function addIpRestrictionIgnoredPaths(site: string, values: string[]): Promise<BulkIpRestrictionIgnoredPathResult> {
  return requestJson<BulkIpRestrictionIgnoredPathResult>('/api/jhoose/ipignoredpaths/bulk', {
    method: 'POST',
    body: JSON.stringify({ site, values }),
  });
}

async function deleteIpRestrictionIgnoredPath(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/ipignoredpaths/${id}`, {
    method: 'DELETE',
  });
}

export function useIpRestrictionIgnoredPathsQuery() {
  return useQuery({
    queryKey: ipRestrictionIgnoredPathsQueryKey,
    queryFn: fetchIpRestrictionIgnoredPaths,
    staleTime: 30000,
    retry: 1,
  });
}

export function useAddIpRestrictionIgnoredPathsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ site, values }: { site: string; values: string[] }) => addIpRestrictionIgnoredPaths(site, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipRestrictionIgnoredPathsQueryKey });
    },
  });
}

export function useDeleteIpRestrictionIgnoredPathMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIpRestrictionIgnoredPath,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<IpRestrictionIgnoredPath[]>(ipRestrictionIgnoredPathsQueryKey, (current) =>
        current ? current.filter((entry) => entry.id !== id) : current
      );
    },
  });
}

export { getErrorMessage };

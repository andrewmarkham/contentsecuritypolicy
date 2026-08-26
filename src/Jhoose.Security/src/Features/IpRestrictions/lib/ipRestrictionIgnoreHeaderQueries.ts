import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, requestJson } from '../../../lib/requestJson';
import { IpRestrictionIgnoreHeader } from '../Types/IpRestrictionIgnoreHeader';

const ipRestrictionIgnoreHeadersQueryKey = ['ignoreheaders'];

async function fetchIpRestrictionIgnoreHeaders(): Promise<IpRestrictionIgnoreHeader[]> {
  return requestJson<IpRestrictionIgnoreHeader[]>('/api/jhoose/ignoreheaders');
}

async function addIpRestrictionIgnoreHeader(headerName: string, headerValue: string, site: string): Promise<IpRestrictionIgnoreHeader> {
  return requestJson<IpRestrictionIgnoreHeader>('/api/jhoose/ignoreheaders', {
    method: 'POST',
    body: JSON.stringify({ headerName, headerValue, site }),
  });
}

async function deleteIpRestrictionIgnoreHeader(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/ignoreheaders/${id}`, {
    method: 'DELETE',
  });
}

export function useIpRestrictionIgnoreHeadersQuery() {
  return useQuery({
    queryKey: ipRestrictionIgnoreHeadersQueryKey,
    queryFn: fetchIpRestrictionIgnoreHeaders,
    staleTime: 30000,
    retry: 1,
  });
}

export function useAddIpRestrictionIgnoreHeaderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ headerName, headerValue, site }: { headerName: string; headerValue: string; site: string }) =>
      addIpRestrictionIgnoreHeader(headerName, headerValue, site),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipRestrictionIgnoreHeadersQueryKey });
    },
  });
}

export function useDeleteIpRestrictionIgnoreHeaderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIpRestrictionIgnoreHeader,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<IpRestrictionIgnoreHeader[]>(ipRestrictionIgnoreHeadersQueryKey, (current) =>
        current ? current.filter((entry) => entry.id !== id) : current
      );
    },
  });
}

export { getErrorMessage };

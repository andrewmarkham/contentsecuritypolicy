import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SecurityHeader } from './Types/securityHeader';
import { getErrorMessage, requestJson } from '../../lib/requestJson';

type HeadersResponse = {
  useHeadersUI: boolean;
  headers: SecurityHeader[];
};

const headersQueryKey = ['securityHeaders'];

export { getErrorMessage };

async function fetchSecurityHeaders(): Promise<HeadersResponse> {
  return requestJson<HeadersResponse>('/api/jhoose/responseheaders');
}

async function updateSecurityHeader(header: SecurityHeader): Promise<SecurityHeader> {
  return requestJson<SecurityHeader>('/api/jhoose/responseheaders', {
    method: 'POST',
    body: JSON.stringify(header),
  });
}

async function deleteSecurityHeader(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/responseheaders/${id}`, {
    method: 'DELETE',
  });
}

export function useSecurityHeadersQuery() {
  return useQuery({
    queryKey: headersQueryKey,
    queryFn: fetchSecurityHeaders,
    staleTime: 30000,
    retry: 1,
  });
}

export function useUpdateSecurityHeaderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['securityHeader'],
    mutationFn: updateSecurityHeader,
    onSuccess: (updatedHeader) => {
      queryClient.setQueryData<HeadersResponse>(headersQueryKey, (current) => {
        if (!current) {
          return { useHeadersUI: true, headers: [updatedHeader] };
        }
        const exists = current.headers.some((header) => header.id === updatedHeader.id);
        return {
          ...current,
          headers: exists
            ? current.headers.map((header) =>
                header.id === updatedHeader.id ? updatedHeader : header
              )
            : [...current.headers, updatedHeader],
        };
      });
    },
  });
}

export function useDeleteSecurityHeaderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['securityHeader'],
    mutationFn: deleteSecurityHeader,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<HeadersResponse>(headersQueryKey, (current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          headers: current.headers.filter((header) => header.id !== id),
        };
      });
    },
  });
}

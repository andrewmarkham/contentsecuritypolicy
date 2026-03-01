import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CspPolicy, CspSandboxPolicy } from '../Types/types';
import { getErrorMessage, requestJson } from '../../../lib/requestJson';

type CspRecord = CspPolicy | CspSandboxPolicy;

const cspQueryKey = ['cspPolicies'];

export { getErrorMessage };

async function fetchCspPolicies(): Promise<CspRecord[]> {
  return requestJson<CspRecord[]>('/api/jhoose/csp');
}

async function updateCspPolicy(policy: CspRecord): Promise<CspRecord> {
  return requestJson<CspRecord>('/api/jhoose/csp', {
    method: 'POST',
    body: JSON.stringify(policy),
  });
}

async function deleteCspPolicy(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/csp/${id}`, {
    method: 'DELETE',
  });
}

export function useCspPoliciesQuery() {
  return useQuery({
    queryKey: cspQueryKey,
    queryFn: fetchCspPolicies,
    staleTime: 30000,
    retry: 1,
  });
}

export function useUpdateCspPolicyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cspPolicy'],
    mutationFn: updateCspPolicy,
    onSuccess: (updatedPolicy) => {
      queryClient.setQueryData<CspRecord[]>(cspQueryKey, (current) => {
        if (!current) {
          return [updatedPolicy];
        }
        const index = current.findIndex((policy) => policy.id === updatedPolicy.id);

        if (index === -1) {
          return [...current, updatedPolicy];
        }

        return current.map((policy) =>
          policy.id === updatedPolicy.id ? updatedPolicy : policy
        );
      });
    },
  });
}

export function useDeleteCspPolicyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cspPolicy'],
    mutationFn: deleteCspPolicy,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<CspRecord[]>(cspQueryKey, (current) => {
        if (!current) {
          return current;
        }
        return current.filter((policy) => policy.id !== id);
      });
    },
  });
}

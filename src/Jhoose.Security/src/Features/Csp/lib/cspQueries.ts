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
        return current.map((policy) =>
          policy.id === updatedPolicy.id ? updatedPolicy : policy
        );
      });
    },
  });
}

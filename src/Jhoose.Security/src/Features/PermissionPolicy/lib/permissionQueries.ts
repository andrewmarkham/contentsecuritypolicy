import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Permission } from './../Types/types';
import { getErrorMessage, requestJson } from '../../../lib/requestJson';

const permissionsQueryKey = ['permissions'];

async function fetchPermissions(): Promise<Permission[]> {
  return requestJson<Permission[]>('/api/jhoose/permissions');
}

async function updatePermission(permission: Permission): Promise<Permission> {
  return requestJson<Permission>('/api/jhoose/permissions', {
    method: 'POST',
    body: JSON.stringify(permission),
  });
}

export function usePermissionsQuery() {
  return useQuery({
    queryKey: permissionsQueryKey,
    queryFn: fetchPermissions,
    staleTime: 30000,
    retry: 1,
  });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['permission'],
    mutationFn: updatePermission,
    onSuccess: (updatedPermission) => {
      queryClient.setQueryData<Permission[]>(permissionsQueryKey, (current) => {
        if (!current) {
          return [updatedPermission];
        }
        const exists = current.some((permission) => permission.key === updatedPermission.key);
        if (!exists) {
          return [...current, updatedPermission];
        }
        return current.map((permission) =>
          permission.key === updatedPermission.key ? updatedPermission : permission
        );
      });
      queryClient.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });
}

export { getErrorMessage };

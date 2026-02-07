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

async function deletePermission(id: string): Promise<void> {
  await requestJson<void>(`/api/jhoose/permissions/${id}`, {
    method: 'DELETE',
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
        const exists = current.some((permission) => permission.id === updatedPermission.id);
        if (!exists) {
          return [...current, updatedPermission];
        }
        return current.map((permission) =>
          permission.id === updatedPermission.id ? updatedPermission : permission
        );
      });
      queryClient.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['permission'],
    mutationFn: deletePermission,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Permission[]>(permissionsQueryKey, (current) => {
        if (!current) {
          return current;
        }
        return current.filter((permission) => permission.id !== id);
      });
    },
  });
}

export { getErrorMessage };

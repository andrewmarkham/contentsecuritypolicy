import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Flex, Select, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useIsMutating } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import { Table } from '../../../../components/DataTable/Table/Table';
import { Header } from '../../../../components/DataTable/Header/Header';
import { Row } from '../../../../components/DataTable/Row/Row';
import { Cell } from '../../../../components/DataTable/Cell/Cell';
import { Toaster } from '../../../../components/Toaster/Toaster';

import { Permission } from '../../../../Features/PermissionPolicy/Types/types';
import { PermissionPolicyData } from '../../../../Features/PermissionPolicy/Data/PermissionPolicyData';
import { RenderPermission } from '../../../../Features/PermissionPolicy/components/RenderPermission/RenderPermission';
import { getErrorMessage, usePermissionsQuery, useDeletePermissionMutation, useUpdatePermissionMutation } from '../../../../Features/PermissionPolicy/lib/permissionQueries';

import { EditPagePermissionItem } from '../EditPagePermissionItem/EditPagePermissionItem';

const GLOBAL_SITE_ID = '*';

// A permission is either left untouched (baseline, from the server), staged as an add/edit
// (kept only in memory until commit), or staged for deletion (only meaningful for a permission
// that already exists on the server - a pending add that gets deleted is just dropped, see
// handleDelete).
type Draft =
    | { kind: 'upsert', permission: Permission }
    | { kind: 'delete', id: string };

export type DialogControls = {
    commit: () => Promise<void>,
};

export type PermissionsPageOverrideDialogProps = {
    contentLink: string,
    registerControls?: (controls: DialogControls) => void,
}

export function PermissionsPageOverrideDialog(props: PermissionsPageOverrideDialogProps) {
    const { Text } = Typography;

    const permissionsQuery = usePermissionsQuery();
    const updatePermissionMutation = useUpdatePermissionMutation();
    const deletePermissionMutation = useDeletePermissionMutation();
    const savingCount = useIsMutating({ mutationKey: ['permission'] });

    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});

    const policyDataByName = useMemo(() => {
        return PermissionPolicyData.reduce((acc, p) => {
            acc[p.name] = p;
            return acc;
        }, {} as Record<string, typeof PermissionPolicyData[number]>);
    }, []);

    const pagePermissions = useMemo(() => {
        return (permissionsQuery.data ?? []).filter((permission) => permission.contentLink === props.contentLink);
    }, [permissionsQuery.data, props.contentLink]);

    // Baseline (server) permissions with any staged, unsaved add/edit/delete applied on top -
    // nothing here has been persisted until commit() runs.
    const permissionsByKey = useMemo(() => {
        const byKey = pagePermissions.reduce((acc, permission) => {
            acc[permission.key] = permission;
            return acc;
        }, {} as Record<string, Permission>);

        for (const [key, draft] of Object.entries(drafts)) {
            if (draft.kind === 'delete') {
                delete byKey[key];
            } else {
                byKey[key] = draft.permission;
            }
        }

        return byKey;
    }, [pagePermissions, drafts]);

    const visiblePermissions = useMemo(() => Object.values(permissionsByKey), [permissionsByKey]);

    const availablePermissions = useMemo(() => {
        return PermissionPolicyData.map((p) => p.name).filter((name) => !permissionsByKey[name]);
    }, [permissionsByKey]);

    function createEmptyPermission(key: string): Permission {
        return {
            id: uuidv4(),
            key,
            mode: 'default',
            scope: 'self',
            allowlist: [],
            site: GLOBAL_SITE_ID,
            contentLink: props.contentLink,
        };
    }

    const handleSaveDraft = useCallback((permission: Permission) => {
        setDrafts((prev) => ({ ...prev, [permission.key]: { kind: 'upsert', permission } }));
        setEditingKey(null);
    }, []);

    const handleDelete = useCallback((permission: Permission) => {
        const isPersisted = pagePermissions.some((p) => p.id === permission.id);
        setDrafts((prev) => {
            const next = { ...prev };
            if (isPersisted) {
                next[permission.key] = { kind: 'delete', id: permission.id };
            } else {
                // Never saved - dropping the pending add is enough, nothing to delete server-side.
                delete next[permission.key];
            }
            return next;
        });
    }, [pagePermissions]);

    // Persists every staged change in one go. Called by the dojo dialog's OK button (see
    // EditorBridge/JhoosePermissionsCommand.js) - nothing here reaches the server until this
    // runs, and cancelling the dialog (or closing without pressing OK) just discards `drafts`
    // in memory.
    const commit = useCallback(async () => {
        const pending = Object.values(drafts);
        if (pending.length === 0) {
            return;
        }
        await Promise.all(pending.map((draft) =>
            draft.kind === 'upsert'
                ? updatePermissionMutation.mutateAsync(draft.permission)
                : deletePermissionMutation.mutateAsync(draft.id)
        ));
        setDrafts({});
    }, [drafts, updatePermissionMutation, deletePermissionMutation]);

    useEffect(() => {
        props.registerControls?.({ commit });
    }, [commit]);

    const editingPermission = editingKey
        ? (permissionsByKey[editingKey] ?? createEmptyPermission(editingKey))
        : null;
    const editingPolicyData = editingKey ? policyDataByName[editingKey] : undefined;

    return (
        <div className="page-override-dialog">
            <Toaster
                show={permissionsQuery.isLoading || permissionsQuery.isFetching || savingCount > 0}
                message={permissionsQuery.isLoading || permissionsQuery.isFetching ? 'Loading...' : 'Saving...'}
            />

            {permissionsQuery.error && (
                <Alert type="error" showIcon message={getErrorMessage(permissionsQuery.error)} style={{ marginBottom: 12 }} />
            )}
            {deletePermissionMutation.error && (
                <Alert type="error" showIcon message={getErrorMessage(deletePermissionMutation.error)} style={{ marginBottom: 12 }} />
            )}

            <Table>
                <Header>
                    <Cell width="150px">Permission</Cell>
                    <Cell>Summary</Cell>
                    <Cell width="50px">&nbsp;</Cell>
                </Header>
                {visiblePermissions.length === 0 && (
                    <Row>
                        <Cell width="150px">&nbsp;</Cell>
                        <Cell><Text type="secondary">No page-level overrides have been created.</Text></Cell>
                        <Cell width="50px">&nbsp;</Cell>
                    </Row>
                )}
                {visiblePermissions.map((permission) => (
                    <Row key={permission.key}>
                        <Cell width="150px">
                            <button className="linkButton" onClick={() => setEditingKey(permission.key)}>{permission.key}</button>
                        </Cell>
                        <Cell>
                            <RenderPermission
                                permission={permission}
                                defaultValue={policyDataByName[permission.key]?.defaultAllowlist ?? ''}
                                isListing={true}
                            />
                        </Cell>
                        <Cell width="50px" align="right">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(permission)}
                                aria-label={`Delete ${permission.key} override`}
                            />
                        </Cell>
                    </Row>
                ))}
            </Table>

            <Flex gap={8} align="center" className="page-override-dialog__add" style={{ marginTop: 12 }}>
                <Select
                    key={availablePermissions.join('|')}
                    placeholder="Add a permission override..."
                    style={{ width: 240 }}
                    options={availablePermissions.map((key) => ({ value: key, label: key }))}
                    onChange={(value) => setEditingKey(value)}
                    disabled={availablePermissions.length === 0}
                />
            </Flex>

            {editingPermission && (
                <EditPagePermissionItem
                    isOpen={true}
                    permission={editingPermission}
                    contentLink={props.contentLink}
                    defaultAllowlist={editingPolicyData?.defaultAllowlist ?? ''}
                    description={editingPolicyData?.description ?? ''}
                    onSave={handleSaveDraft}
                    onClose={() => setEditingKey(null)}
                />
            )}
        </div>
    );
}

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

import { CspPolicy, CspSandboxPolicy } from '../../../../Features/Csp/Types/types';
import { ContentSecurityPolicyData } from '../../../../Features/Csp/Data/ContentSecurityPolicies';
import { getPolicyOptionsDisplay, getSandboxOptionsDisplay, getSchemaSourceDisplay } from '../../../../Features/Csp/lib/helpers';
import { getErrorMessage, useCspPoliciesQuery, useDeleteCspPolicyMutation, useUpdateCspPolicyMutation } from '../../../../Features/Csp/lib/cspQueries';

import { EditPageCspItem } from '../EditPageCspItem/EditPageCspItem';
import { EditPageSandboxCspItem } from '../EditPageSandboxCspItem/EditPageSandboxCspItem';

type CspRecord = CspPolicy | CspSandboxPolicy;

const GLOBAL_SITE_ID = '*';

// A directive is either left untouched (baseline, from the server), staged as an add/edit
// (kept only in memory until commit), or staged for deletion (only meaningful for a directive
// that already exists on the server - a pending add that gets deleted is just dropped, see
// handleDelete).
type Draft =
    | { kind: 'upsert', policy: CspRecord }
    | { kind: 'delete', id: string };

export type DialogControls = {
    commit: () => Promise<void>,
};

export type PageOverrideDialogProps = {
    contentLink: string,
    registerControls?: (controls: DialogControls) => void,
}

export function PageOverrideDialog(props: PageOverrideDialogProps) {
    const { Text } = Typography;

    const cspPoliciesQuery = useCspPoliciesQuery();
    const updatePolicyMutation = useUpdateCspPolicyMutation();
    const deletePolicyMutation = useDeleteCspPolicyMutation();
    const savingCount = useIsMutating({ mutationKey: ['cspPolicy'] });

    const [editingDirective, setEditingDirective] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});

    const pagePolicies = useMemo(() => {
        return (cspPoliciesQuery.data ?? []).filter((policy) => policy.contentLink === props.contentLink);
    }, [cspPoliciesQuery.data, props.contentLink]);

    // Baseline (server) policies with any staged, unsaved add/edit/delete applied on top -
    // nothing here has been persisted until commit() runs.
    const policiesByName = useMemo(() => {
        const byName = pagePolicies.reduce((acc, policy) => {
            acc[policy.policyName] = policy;
            return acc;
        }, {} as Record<string, CspRecord>);

        for (const [name, draft] of Object.entries(drafts)) {
            if (draft.kind === 'delete') {
                delete byName[name];
            } else {
                byName[name] = draft.policy;
            }
        }

        return byName;
    }, [pagePolicies, drafts]);

    const visiblePolicies = useMemo(() => Object.values(policiesByName), [policiesByName]);

    const availableDirectives = useMemo(() => {
        return Object.keys(ContentSecurityPolicyData).filter((key) => !policiesByName[key]);
    }, [policiesByName]);

    function createEmptyPolicy(policyName: string): CspRecord {
        if (policyName === 'sandbox') {
            return {
                id: uuidv4(),
                policyName,
                site: GLOBAL_SITE_ID,
                contentLink: props.contentLink,
                sandboxOptions: {
                    enabled: false,
                    allowDownloads: false,
                    allowForms: false,
                    allowModals: false,
                    allowOrientationLock: false,
                    allowPointerLock: false,
                    allowPopups: false,
                    allowPopupsToEscapeSandbox: false,
                    allowPresentation: false,
                    allowSameOrigin: false,
                    allowScripts: false,
                    allowTopNavigation: false,
                    allowTopNavigationByUserActivation: false,
                    allowTopNavigationToCustomProtocols: false,
                },
                value: '',
                reportOnly: false,
            };
        }

        return {
            id: uuidv4(),
            policyName,
            site: GLOBAL_SITE_ID,
            contentLink: props.contentLink,
            options: {
                wildcard: false,
                none: false,
                self: false,
                unsafeEval: false,
                wasmUnsafeEval: false,
                unsafeHashes: false,
                unsafeInline: false,
                strictDynamic: false,
                nonce: false,
            },
            schemaSource: {
                enabled: false,
                http: false,
                https: false,
                data: false,
                mediastream: false,
                blob: false,
                filesystem: false,
                ws: false,
                wss: false,
            },
            value: '',
            reportOnly: false,
        };
    }

    function getSummary(policy: CspRecord): string {
        if (policy.policyName === 'sandbox') {
            return getSandboxOptionsDisplay(policy as CspSandboxPolicy);
        }
        const cspPolicy = policy as CspPolicy;
        const value = cspPolicy.options?.none ? '' : cspPolicy.value ?? '';
        return `${getPolicyOptionsDisplay(cspPolicy)} ${getSchemaSourceDisplay(cspPolicy)} ${value}`.trim();
    }

    const handleSaveDraft = useCallback((policy: CspRecord) => {
        setDrafts((prev) => ({ ...prev, [policy.policyName]: { kind: 'upsert', policy } }));
        setEditingDirective(null);
    }, []);

    const handleDelete = useCallback((policy: CspRecord) => {
        const isPersisted = pagePolicies.some((p) => p.id === policy.id);
        setDrafts((prev) => {
            const next = { ...prev };
            if (isPersisted) {
                next[policy.policyName] = { kind: 'delete', id: policy.id };
            } else {
                // Never saved - dropping the pending add is enough, nothing to delete server-side.
                delete next[policy.policyName];
            }
            return next;
        });
    }, [pagePolicies]);

    // Persists every staged change in one go. Called by the dojo dialog's OK button (see
    // EditorBridge/JhooseCommand.js) - nothing here reaches the server until this runs, and
    // cancelling the dialog (or closing without pressing OK) just discards `drafts` in memory.
    const commit = useCallback(async () => {
        const pending = Object.values(drafts);
        if (pending.length === 0) {
            return;
        }
        await Promise.all(pending.map((draft) =>
            draft.kind === 'upsert'
                ? updatePolicyMutation.mutateAsync(draft.policy)
                : deletePolicyMutation.mutateAsync(draft.id)
        ));
        setDrafts({});
    }, [drafts, updatePolicyMutation, deletePolicyMutation]);

    useEffect(() => {
        props.registerControls?.({ commit });
    }, [commit]);

    const editingPolicy = editingDirective
        ? (policiesByName[editingDirective] ?? createEmptyPolicy(editingDirective))
        : null;

    return (
        <div className="page-override-dialog">
            <Toaster
                show={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching || savingCount > 0}
                message={cspPoliciesQuery.isLoading || cspPoliciesQuery.isFetching ? 'Loading...' : 'Saving...'}
            />

            {cspPoliciesQuery.error && (
                <Alert type="error" showIcon message={getErrorMessage(cspPoliciesQuery.error)} style={{ marginBottom: 12 }} />
            )}
            {deletePolicyMutation.error && (
                <Alert type="error" showIcon message={getErrorMessage(deletePolicyMutation.error)} style={{ marginBottom: 12 }} />
            )}

            <Table>
                <Header>
                    <Cell width="150px">Policy</Cell>
                    <Cell>Summary</Cell>
                    <Cell width="50px">&nbsp;</Cell>
                </Header>
                {visiblePolicies.length === 0 && (
                    <Row>
                        <Cell width="150px">&nbsp;</Cell>
                        <Cell><Text type="secondary">No page-level overrides have been created.</Text></Cell>
                        <Cell width="50px">&nbsp;</Cell>
                    </Row>
                )}
                {visiblePolicies.map((policy) => (
                    <Row key={policy.policyName}>
                        <Cell width="150px">
                            <button className="linkButton" onClick={() => setEditingDirective(policy.policyName)}>{policy.policyName}</button>
                        </Cell>
                        <Cell>{getSummary(policy)}</Cell>
                        <Cell width="50px" align="right">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(policy)}
                                aria-label={`Delete ${policy.policyName} override`}
                            />
                        </Cell>
                    </Row>
                ))}
            </Table>

            <Flex gap={8} align="center" className="page-override-dialog__add" style={{ marginTop: 12 }}>
                <Select
                    key={availableDirectives.join('|')}
                    placeholder="Add a policy override..."
                    style={{ width: 240 }}
                    options={availableDirectives.map((key) => ({ value: key, label: key }))}
                    onChange={(value) => setEditingDirective(value)}
                    disabled={availableDirectives.length === 0}
                />
            </Flex>

            {editingPolicy && editingDirective === 'sandbox' && (
                <EditPageSandboxCspItem
                    isOpen={true}
                    policy={editingPolicy as CspSandboxPolicy}
                    contentLink={props.contentLink}
                    onSave={handleSaveDraft}
                    onClose={() => setEditingDirective(null)}
                />
            )}
            {editingPolicy && editingDirective !== 'sandbox' && (
                <EditPageCspItem
                    isOpen={true}
                    policy={editingPolicy as CspPolicy}
                    contentLink={props.contentLink}
                    onSave={handleSaveDraft}
                    onClose={() => setEditingDirective(null)}
                />
            )}
        </div>
    );
}

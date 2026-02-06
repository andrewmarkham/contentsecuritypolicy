import React, { useEffect, useState } from 'react';
import { Permission, PermissionSource } from '../Types/types';

import { Radio, Select, Input, Flex, Button, message } from 'antd';
import { Row } from '../../../components/DataTable/Row';
import { Cell } from '../../../components/DataTable/Cell';
import { Toaster } from '../../../components/Toaster';
import { RenderPermission } from './RenderPermission';
import { getErrorMessage, useUpdatePermissionMutation } from '../lib/permissionQueries';
import { SiteOverrideAlert } from '../../../components/SiteOverrideAlert/SiteOverrideAlert';

const { TextArea } = Input;

type Props = {
    data: Partial<Permission>,
    default: string,
    source: PermissionSource,
    siteName: string,
    inheritedPermission: Partial<Permission> | null,
    onSaveSiteOverride?: (permission: Permission) => void,
    onClearSiteOverride?: () => void
}

export const PermissionEditor: React.FC<Props> = ({ data, default: defaultValue, source, siteName, inheritedPermission, onSaveSiteOverride, onClearSiteOverride }) => {

    const [permissionData, setPermissionData] = useState(data);
    const [isDirty, setIsDirty] = useState(false);
    const [isOverrideEnabled, setIsOverrideEnabled] = useState(source === "overridden");
    const [messageApi, contextHolder] = message.useMessage();
    const updatePermissionMutation = useUpdatePermissionMutation();
    const canUseSiteOverride = source !== "default";
    const isEditable = source === "default" || isOverrideEnabled;
    const canSave = canUseSiteOverride ? (!isOverrideEnabled || isDirty) : isDirty;

    useEffect(() => {
        if (updatePermissionMutation.error) {
            messageApi.error(getErrorMessage(updatePermissionMutation.error));
        }
    }, [messageApi, updatePermissionMutation.error]);

    useEffect(() => {
        setPermissionData(data);
        setIsOverrideEnabled(source === "overridden");
        setIsDirty(false);
    }, [data, source]);

    function handleSaveChanges(event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        // basic validation
        if (!permissionData?.key) {
            console.warn('Cannot save permission: missing key');
            return;
        }

        // Normalize payload into a full Permission shape (use defaults where appropriate)
        const payload: Permission = {
            key: permissionData.key,
            mode: (permissionData.mode as Permission['mode']) || 'default',
            scope: (permissionData.scope as Permission['scope']) || 'self',
            allowlist: Array.isArray(permissionData.allowlist) ? permissionData.allowlist : (permissionData.allowlist ? [String(permissionData.allowlist)] : []),
        } as Permission;

        if (canUseSiteOverride) {
            if (isOverrideEnabled) {
                onSaveSiteOverride?.(payload);
                messageApi.success('Permission override saved.');
            } else {
                onClearSiteOverride?.();
                messageApi.success('Permission reverted to inherited.');
            }
            setIsDirty(false);
            return;
        }

        try {
            localStorage.setItem(`permission:${payload.key}`, JSON.stringify(payload));
        } catch (err) {
            console.error('Failed to save permission locally:', err);
        }

        updatePermissionMutation.mutate(payload, {
            onSuccess: () => {
                setPermissionData(payload);
                setIsDirty(false);
                messageApi.success('Permission saved.');
            },
        });
    }
    return (
        <>
            {contextHolder}
            <Toaster show={updatePermissionMutation.isPending} message={"Saving..." } />
            <div>
                <h3>Edit Permission</h3>
                {canUseSiteOverride && (
                    <SiteOverrideAlert
                        siteName={siteName}
                        itemLabel="permission"
                        isOverrideEnabled={isOverrideEnabled}
                        onOverrideChange={(checked) => {
                            setIsOverrideEnabled(checked);
                            if (!checked && inheritedPermission) {
                                setPermissionData(inheritedPermission);
                            }
                            setIsDirty(true);
                        }}
                    />
                )}
                <Row>
                    <Cell width='300px'>
                        <label>
                            <span style={{marginRight: "5px"}}>Mode:</span>
                            <Select options={
                                [
                                    { value: 'default', label: <span>Default</span> },
                                    { value: 'enabled', label: <span>Enabled</span> },
                                    { value: 'report', label: <span>Enabled (Report Only)</span> },
                                    { value: 'disabled', label: <span>Disabled</span> }
                                ]} 
                                style={{width: "200px"}}
                                value={permissionData?.mode || "default"}
                                disabled={!isEditable}
                                onChange={(value) => {
                                    setPermissionData({ ...permissionData, mode: value as Permission['mode'] });
                                    setIsDirty(true);
                                }}
                                />
                        </label>
                    </Cell>
                {(permissionData.mode === "enabled" || permissionData.mode === "report") && (
                    <Cell>
                        <label>
                            <span style={{marginRight: "5px"}}>Scope:</span>

                            <Radio.Group
                                value={permissionData?.scope || "self"}
                                options={[
                                { value: "self", label: 'Self' },
                                { value: "all", label: 'All' },
                                ]}
                                optionType="button"
                                buttonStyle="solid"
                                disabled={!isEditable}
                                onChange={(e) => {
                                    setPermissionData({ ...permissionData, scope: e.target.value });
                                    setIsDirty(true);
                                }}
                            />
                        </label>
                    </Cell>
                )}
                </Row>
                {((permissionData.mode === "enabled" || permissionData.mode === "report") && permissionData.scope === "self") && (
                    <Row>
                        <Cell>
                        <label>
                            <span style={{marginBottom: "10px", display: "block"}}>Allowlist:</span>
                                <TextArea
                                    value={permissionData?.allowlist?.join(" ")}
                                    disabled={!isEditable}
                                    onChange={(e) => {
                                        setPermissionData({ ...permissionData, allowlist: e.target.value.split(" ") });
                                        setIsDirty(true);
                                    }}
                                    placeholder="Enter allowlist items separated by spaces"
                                    autoSize={{ minRows: 3, maxRows: 10 }}
                                />
                        </label>
                        </Cell>
                    </Row>
                )}
            </div>
            <Flex justify='space-between'>
                <RenderPermission permission={permissionData as Permission} defaultValue={defaultValue}  isListing={false}/>
                <div style={{marginTop: "12px"}}>
                    <Button type="primary" 
                        disabled={!canSave}
                        onClick={handleSaveChanges}
                        >Save Change</Button>
                </div>
            </Flex>
            
        </>
    );
};

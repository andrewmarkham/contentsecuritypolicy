import React, { useEffect, useMemo, useState } from 'react';

import { Permission, PermissionSource } from '../../Types/types';
import { SiteOverrideAlert } from '../../../../components/SiteOverrideAlert/SiteOverrideAlert';
import { RenderPermission } from '../RenderPermission';
import { getErrorMessage, useDeletePermissionMutation, useUpdatePermissionMutation } from '../../lib/permissionQueries';

import { Flex, Input, Modal, Radio, Select, Typography, message } from 'antd';

type Props = {
    isOpen: boolean,
    permission: Permission,
    source: PermissionSource,
    siteId: string,
    siteName: string,
    inheritedPermission: Permission,
    defaultAllowlist: string,
    description: string,
    compatibility?: React.ReactNode,
    onClose: () => void
}

const { TextArea } = Input;

export function EditPermissionItem(props: Props) {
    const [permissionData, setPermissionData] = useState(props.permission);
    const [isDirty, setIsDirty] = useState(false);
    const [isOverrideEnabled, setIsOverrideEnabled] = useState(props.source === "overridden");
    const [overridePolicyId, setOverridePolicyId] = useState<string | null>(
        props.source === "overridden" ? props.permission.id : null
    );
    const [modal, modalContextHolder] = Modal.useModal();
    const [messageApi, contextHolder] = message.useMessage();
    const updatePermissionMutation = useUpdatePermissionMutation();
    const deletePermissionMutation = useDeletePermissionMutation();
    const canUseSiteOverride = props.source !== "default";
    const isEditable = props.source === "default" || isOverrideEnabled;
    const canSave = canUseSiteOverride ? (!isOverrideEnabled || isDirty) : isDirty;

    useEffect(() => {
        if (updatePermissionMutation.error) {
            messageApi.error(getErrorMessage(updatePermissionMutation.error));
        }
        if (deletePermissionMutation.error) {
            messageApi.error(getErrorMessage(deletePermissionMutation.error));
        }
    }, [messageApi, updatePermissionMutation.error, deletePermissionMutation.error]);

    useEffect(() => {
        setPermissionData(props.permission);
        setIsOverrideEnabled(props.source === "overridden");
        setOverridePolicyId(props.source === "overridden" ? props.permission.id : null);
        setIsDirty(false);
    }, [props.permission, props.source, props.isOpen]);

    const handleOk = () => {
        if (canUseSiteOverride && !isOverrideEnabled) {
            if (props.source === "overridden") {
                const policyIdToDelete = overridePolicyId ?? permissionData.id;
                modal.confirm({
                    title: "Revert to inherited permission?",
                    content: "This will delete the site-specific override and restore the inherited permission.",
                    okText: "Revert",
                    cancelText: "Cancel",
                    onOk: () =>
                        deletePermissionMutation.mutate(policyIdToDelete, {
                            onSuccess: () => {
                                messageApi.success('Override removed.');
                                props.onClose();
                            },
                        }),
                });
                return;
            }
            props.onClose();
            return;
        }

        updatePermissionMutation.mutate({
            ...permissionData,
            site: props.siteId,
        }, {
            onSuccess: () => {
                messageApi.success('Permission saved.');
                props.onClose();
            },
        });
    };

    const handleCancel = () => {
        props.onClose();
    };

    const renderPermission = useMemo(() => {
        return (
            <RenderPermission
                permission={permissionData}
                defaultValue={props.defaultAllowlist}
                isListing={false}
            />
        );
    }, [permissionData, props.defaultAllowlist]);

    return (
        <>
            {contextHolder}
            {modalContextHolder}
            <Modal
                destroyOnHidden
                centered={true}
                title="Edit Permission"
                open={props.isOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Save"
                okButtonProps={{ disabled: !canSave }}
                width={"75vw"}
            >
                <Flex vertical gap={12}>
                    {canUseSiteOverride && (
                        <SiteOverrideAlert
                            siteName={props.siteName}
                            itemLabel="permission"
                            isOverrideEnabled={isOverrideEnabled}
                            onOverrideChange={(checked) => {
                                setIsOverrideEnabled(checked);
                                if (!checked && props.inheritedPermission) {
                                    setPermissionData(props.inheritedPermission);
                                }
                                if (checked && overridePolicyId === null) {
                                    setOverridePolicyId(permissionData.id);
                                }
                                setIsDirty(true);
                            }}
                        />
                    )}

                    <div>
                        <Typography.Title level={4} style={{ marginBottom: 0 }}>
                            {permissionData.key}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            {props.description}
                        </Typography.Text>
                    </div>

                    <Flex align="center" gap={16} wrap={false}>
                        <div style={{ minWidth: "300px" }}>
                            <label>
                                <span style={{ marginRight: "5px" }}>Mode:</span>
                                <Select
                                    options={[
                                        { value: 'default', label: <span>Default</span> },
                                        { value: 'enabled', label: <span>Enabled</span> },
                                        { value: 'report', label: <span>Enabled (Report Only)</span> },
                                        { value: 'disabled', label: <span>Disabled</span> },
                                    ]}
                                    style={{ width: "200px" }}
                                    value={permissionData?.mode || "default"}
                                    disabled={!isEditable}
                                    onChange={(value) => {
                                        setPermissionData({ ...permissionData, mode: value as Permission['mode'] });
                                        setIsDirty(true);
                                    }}
                                />
                            </label>
                        </div>
                        {(permissionData.mode === "enabled" || permissionData.mode === "report") && (
                            <div>
                                <label>
                                    <span style={{ marginRight: "5px" }}>Scope:</span>

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
                            </div>
                        )}
                    </Flex>

                    {((permissionData.mode === "enabled" || permissionData.mode === "report") && permissionData.scope === "self") && (
                        <div>
                            <label>
                                <span style={{ marginBottom: "10px", display: "block" }}>Allowlist:</span>
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
                        </div>
                    )}

                    <Flex justify='space-between' align="center">
                        {renderPermission}
                    </Flex>

                    {props.compatibility}
                </Flex>
            </Modal>
        </>
    );
}

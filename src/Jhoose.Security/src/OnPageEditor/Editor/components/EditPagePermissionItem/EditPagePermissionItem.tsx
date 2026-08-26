import React, { useEffect, useMemo, useState } from 'react';

import { Permission } from '../../../../Features/PermissionPolicy/Types/types';
import { RenderPermission } from '../../../../Features/PermissionPolicy/components/RenderPermission/RenderPermission';
import { Flex, Input, Modal, Radio, Select } from 'antd';

type Props = {
    isOpen: boolean,
    permission: Permission,
    contentLink: string,
    defaultAllowlist: string,
    description: string,
    onSave: (permission: Permission) => void,
    onClose: () => void
}

const { TextArea } = Input;

export function EditPagePermissionItem(props: Props) {

    const [permission, setPermission] = useState(props.permission);

    const title = `Edit Page Permission`;

    useEffect(() => {
        setPermission(props.permission);
    }, [props.permission, props.isOpen]);

    const handleOk = () => {
        props.onSave({
            ...permission,
            contentLink: props.contentLink,
        });
    };

    const handleCancel = () => {
        props.onClose();
    };

    const renderPermission = useMemo(() => {
        return (
            <RenderPermission
                permission={permission}
                defaultValue={props.defaultAllowlist}
                isListing={false}
            />
        );
    }, [permission, props.defaultAllowlist]);

    return (
        <Modal
            destroyOnHidden
            centered={true}
            title={title}
            open={props.isOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={"75vw"}
        >
            <Flex vertical gap={12}>
                <div>
                    <h3>{permission.key}</h3>
                    <p>{props.description}</p>
                </div>

                <Flex align="center" gap={16} wrap={false}>
                    <div>
                        <label>
                            <span>Mode:</span>
                            <Select
                                options={[
                                    { value: 'default', label: <span>Default</span> },
                                    { value: 'enabled', label: <span>Enabled</span> },
                                    { value: 'report', label: <span>Enabled (Report Only)</span> },
                                    { value: 'disabled', label: <span>Disabled</span> },
                                ]}
                                value={permission?.mode || "default"}
                                onChange={(value) => {
                                    setPermission({ ...permission, mode: value as Permission['mode'] });
                                }}
                            />
                        </label>
                    </div>
                    {(permission.mode === "enabled" || permission.mode === "report") && (
                        <div>
                            <label>
                                <span>Scope:</span>
                                <Radio.Group
                                    value={permission?.scope || "self"}
                                    options={[
                                        { value: "self", label: 'Self' },
                                        { value: "all", label: 'All' },
                                    ]}
                                    optionType="button"
                                    buttonStyle="solid"
                                    onChange={(e) => {
                                        setPermission({ ...permission, scope: e.target.value });
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </Flex>

                {((permission.mode === "enabled" || permission.mode === "report") && permission.scope === "self") && (
                    <div>
                        <label>
                            <span>Allowlist:</span>
                            <TextArea
                                value={permission?.allowlist?.join(" ")}
                                onChange={(e) => {
                                    setPermission({ ...permission, allowlist: e.target.value.split(" ") });
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
            </Flex>
        </Modal>
    );
}

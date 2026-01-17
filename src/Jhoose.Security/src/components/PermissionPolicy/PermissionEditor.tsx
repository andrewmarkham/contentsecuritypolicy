import React, { useEffect, useState } from 'react';
import { Permission } from '././types';

import { Radio,Select, Input, Flex, Button } from 'antd';
import { Row } from '../DataTable/Row';
import { Cell } from '../DataTable/Cell';
import { Toaster } from '../Toaster';
import { RenderPermission } from './RenderPermission';

const { TextArea } = Input;

export const PermissionEditor: React.FC<{ data: Partial<Permission>, default: string }> = ({ data, default: defaultValue }) => {

    const [permissionData, setPermissionData] = useState(data);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    function handleSaveChanges(event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        setIsSaving(true);
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

        try {
            localStorage.setItem(`permission:${payload.key}`, JSON.stringify(payload));

            fetch(`/api/jhoose/permissions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }).then(data => {
                setIsSaving(false);
                console.log('Permission saved to server:', data);
            }).catch(err => {
                console.error('Failed to save permission to server:', err);
            });

            setPermissionData(payload);
            setIsDirty(false);
            console.log('Permission saved:', payload);
        } catch (err) {
            setIsSaving(false);
            console.error('Failed to save permission:', err);
        }
    }
    return (
        <>
            <Toaster show={isSaving} message={"Saving..." } />
            <div>
                <h3>Edit Permission</h3>
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
                        disabled={!isDirty}
                        onClick={handleSaveChanges}
                        >Save Change</Button>
                </div>
            </Flex>
            
        </>
    );
};



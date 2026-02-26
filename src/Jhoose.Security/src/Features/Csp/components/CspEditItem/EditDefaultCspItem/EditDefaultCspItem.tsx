import React, { useEffect, useState, useMemo } from 'react';

import { CspOptions } from '../../CspOptions/CspOptions';
import { SiteOverrideAlert } from '../../../../../components/SiteOverrideAlert/SiteOverrideAlert';

import { CspSchemaSources } from '../../CspSchemaSources/CspSchemaSources';
import { CspPolicy, PolicyOptions, PolicySource, SchemaSource } from '../../../Types/types';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay, isScriptPolicy as _isScriptPolicy } from '../../../lib/helpers';
import { Checkbox, Divider, Flex, Input, Modal, message } from 'antd';
import { getErrorMessage, useDeleteCspPolicyMutation, useUpdateCspPolicyMutation } from '../../../lib/cspQueries';
import { ContentSecurityPolicyData } from '../../../Data/ContentSecurityPolicies';
import { FieldSet } from '../../../../../components/FieldSet/FieldSet';
import { TagInput } from '../../../../../components/TagInput/TagInput';


type Props = {
    isOpen: boolean,
    policy: CspPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspPolicy | null,
    onClose: () => void
}

export function EditDefaultCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
    const [value, setValue] = useState(policy.value);
    const [isOverrideEnabled, setIsOverrideEnabled] = useState(props.source === "overridden");
    const [overridePolicyId, setOverridePolicyId] = useState<string | null>(
        props.source === "overridden" ? props.policy.id : null
    );
    const [modal, modalContextHolder] = Modal.useModal();
    const [messageApi, contextHolder] = message.useMessage();
    const updatePolicyMutation = useUpdateCspPolicyMutation();
    const deletePolicyMutation = useDeleteCspPolicyMutation();
    const canUseSiteOverride = props.source !== "default";
    const isEditable = props.source === "default" || isOverrideEnabled;

    const title = `Edit Policy`;

    const { TextArea } = Input;

    useEffect(() => {
        if (updatePolicyMutation.error) {
            messageApi.error(getErrorMessage(updatePolicyMutation.error));
        }
        if (deletePolicyMutation.error) {
            messageApi.error(getErrorMessage(deletePolicyMutation.error));
        }
    }, [messageApi, updatePolicyMutation.error, deletePolicyMutation.error]);

    useEffect(() => {
        setPolicy(props.policy);
        setValue(props.policy.value);
        setIsOverrideEnabled(props.source === "overridden");
        setOverridePolicyId(props.source === "overridden" ? props.policy.id : null);
    }, [props.policy, props.source, props.isOpen]);

    function setOptions(options: PolicyOptions) {
        var newPolicy: CspPolicy = {
            ...policy,
            options: { ...options },
            schemaSource: { ...policy.schemaSource },
        }
        setPolicy(newPolicy);
    }

    function setSchemaSource(schemaSource: SchemaSource) {
        var newPolicy: CspPolicy = {
            ...policy,
            options: { ...policy.options },
            schemaSource: { ...schemaSource }
        }
        setPolicy(newPolicy);
    }

    function setPolicyValue(key: string, value: string) {
        var newPolicy: CspPolicy = {
            ...policy,
            options: { ...policy.options },
            schemaSource: { ...policy.schemaSource }
        }

        switch (key) {
            case "value":
                newPolicy.value = value;
                setValue(value);
                break;
            case "mode":
                newPolicy.reportOnly = !policy.reportOnly;
                break;
            default:
                break;
        }
        setPolicy(newPolicy);
    }

    const handleOk = () => {
        if (canUseSiteOverride && !isOverrideEnabled) {
            if (props.source === "overridden") {
                const policyIdToDelete = overridePolicyId ?? policy.id;
                modal.confirm({
                    title: "Revert to inherited policy?",
                    content: "This will delete the site-specific override and restore the inherited policy.",
                    okText: "Revert",
                    cancelText: "Cancel",
                    onOk: () =>
                        deletePolicyMutation.mutate(policyIdToDelete, {
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

        updatePolicyMutation.mutate({
            ...policy,
            site: props.siteId,
        }, {
            onSuccess: () => props.onClose(),
        });
    };

    const handleCancel = () => {
        props.onClose();
    };

    const calculatedPolicy = useMemo(() => {
        return `${policy.policyName} ${getPolicyOptionsDisplay(policy)} ${getSchemaSourceDisplay(policy)}`;
    }, [policy.options, policy.schemaSource, value]);

    const isScriptPolicy = useMemo(() => {
        return _isScriptPolicy(policy);
    }, [policy.policyName]);

    return (
        <>
            {contextHolder}
            {modalContextHolder}
            <Modal
                destroyOnHidden
                title={title}
                open={props.isOpen}
                onOk={handleOk}
                centered={true}
                onCancel={handleCancel}
                width={"75vw"}
            >
                <Flex vertical>
                    <div>
                        {canUseSiteOverride && (
                            <SiteOverrideAlert
                                siteName={props.siteName}
                                itemLabel="policy"
                                isOverrideEnabled={isOverrideEnabled}
                                onOverrideChange={(checked) => {
                                    setIsOverrideEnabled(checked);
                                    if (!checked && props.inheritedPolicy) {
                                        setPolicy(props.inheritedPolicy);
                                        setValue(props.inheritedPolicy.value);
                                    }
                                    if (checked && overridePolicyId === null) {
                                        setOverridePolicyId(policy.id);
                                    }
                                }}
                            />
                        )}

                        <h3>{policy.policyName}</h3>

                        <div className="summary" dangerouslySetInnerHTML={{ __html: ContentSecurityPolicyData[policy.policyName]?.summaryText || '' }}></div>

                    </div>

                    <div>
                        <FieldSet className="modal" legend="Mode">
                            <Checkbox disabled={!isEditable} checked={policy.reportOnly} onChange={(e) => {
                                setPolicyValue("mode", e.target.value);
                            }}>Report Only</Checkbox>
                        </FieldSet>
                    </div>

                    <div >
                        <CspOptions
                            options={policy.options}
                            showScriptOptions={isScriptPolicy}
                            disabled={!isEditable}
                            update={setOptions}
                        ></CspOptions>
                    </div>
                    <div >
                        <CspSchemaSources
                            disabled={!isEditable || (policy.options?.none ?? true)}
                            schemaSource={policy.schemaSource}
                            update={setSchemaSource}></CspSchemaSources>
                    </div>

                    <div>
                        <TagInput
                            disabled={!isEditable || (policy.options?.none ?? true)}
                            placeholder='Host Source'
                            value={policy.value}
                            onChange={(e) => {
                                setPolicyValue("value", e);
                            }}/>
                        <Divider orientation="left">Policy</Divider>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
            </Modal>
        </>
    )
}

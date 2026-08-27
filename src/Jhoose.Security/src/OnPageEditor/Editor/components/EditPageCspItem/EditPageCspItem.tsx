import React, { useEffect, useMemo, useState } from 'react';

import { CspOptions } from '../../../../Features/Csp/components/CspOptions/CspOptions';
import { CspSchemaSources } from '../../../../Features/Csp/components/CspSchemaSources/CspSchemaSources';
import { CspPolicy, PolicyOptions, SchemaSource } from '../../../../Features/Csp/Types/types';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay, isScriptPolicy as _isScriptPolicy } from '../../../../Features/Csp/lib/helpers';
import { Checkbox, Divider, Flex, Input, Modal } from 'antd';
import { ContentSecurityPolicyData } from '../../../../Features/Csp/Data/ContentSecurityPolicies';
import { FieldSet } from '../../../../components/FieldSet/FieldSet';
import { TagInput } from '../../../../components/TagInput/TagInput';

type Props = {
    isOpen: boolean,
    policy: CspPolicy,
    contentLink: string,
    onSave: (policy: CspPolicy) => void,
    onClose: () => void
}

export function EditPageCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
    const [value, setValue] = useState(policy.value);

    const title = `Edit Page Policy`;

    const { TextArea } = Input;

    useEffect(() => {
        setPolicy(props.policy);
        setValue(props.policy.value);
    }, [props.policy, props.isOpen]);

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
        props.onSave({
            ...policy,
            contentLink: props.contentLink,
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
                        <h3>{policy.policyName}</h3>

                        <div className="summary" dangerouslySetInnerHTML={{ __html: ContentSecurityPolicyData[policy.policyName]?.summaryText || '' }}></div>
                    </div>

                    <div>
                        <FieldSet className="modal" legend="Mode">
                            <Checkbox checked={policy.reportOnly} onChange={(e) => {
                                setPolicyValue("mode", e.target.value);
                            }}>Report Only</Checkbox>
                        </FieldSet>
                    </div>

                    <div>
                        <CspOptions
                            options={policy.options}
                            showScriptOptions={isScriptPolicy}
                            disabled={false}
                            update={setOptions}
                        ></CspOptions>
                    </div>
                    <div>
                        <CspSchemaSources
                            disabled={policy.options?.none ?? true}
                            schemaSource={policy.schemaSource}
                            update={setSchemaSource}></CspSchemaSources>
                    </div>

                    <div>
                        <TagInput
                            disabled={policy.options?.none ?? true}
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

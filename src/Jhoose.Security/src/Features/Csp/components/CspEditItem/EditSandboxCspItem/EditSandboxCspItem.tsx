import React, { useEffect, useState, useMemo } from 'react';

import { CspSandboxPolicy, PolicySource, SandboxOptions } from '../../../Types/types';
import { CspSandboxOptions } from '../../CspSandboxOptions/CspSandboxOptions';
import { SiteOverrideAlert } from '../../../../../components/SiteOverrideAlert/SiteOverrideAlert';
import { getSandboxOptionsDisplay } from '../../../lib/helpers';
import { Divider, Flex, Modal, message } from 'antd';
import { getErrorMessage, useDeleteCspPolicyMutation, useUpdateCspPolicyMutation } from '../../../lib/cspQueries';
import { ContentSecurityPolicyData } from '../../../Data/ContentSecurityPolicies';

type Props = {
    isOpen: boolean,
    policy: CspSandboxPolicy,
    source: PolicySource,
    siteId: string,
    siteName: string,
    inheritedPolicy: CspSandboxPolicy | null,
    onClose: () => void
}

export function EditSandboxCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
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
        setIsOverrideEnabled(props.source === "overridden");
        setOverridePolicyId(props.source === "overridden" ? props.policy.id : null);
    }, [props.policy, props.source, props.isOpen]);

    function setSandboxOptions(options: SandboxOptions) {

        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: { ...options },
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
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return (
        <>
            {contextHolder}
            {modalContextHolder}
            <Modal
                destroyOnHidden={true}
                centered={true}
                title={title}
                open={props.isOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"75vw"}
            >
                <Flex vertical>

                    {canUseSiteOverride && (
                        <SiteOverrideAlert
                            siteName={props.siteName}
                            itemLabel="policy"
                            isOverrideEnabled={isOverrideEnabled}
                            onOverrideChange={(checked) => {
                                setIsOverrideEnabled(checked);
                                if (!checked && props.inheritedPolicy) {
                                    setPolicy(props.inheritedPolicy);
                                }
                                if (checked && overridePolicyId === null) {
                                    setOverridePolicyId(policy.id);
                                }
                            }}
                        />
                    )}

                    <div>
                        <h3>{policy.policyName}</h3>

                        <div className="summary" dangerouslySetInnerHTML={{ __html: ContentSecurityPolicyData[policy.policyName]?.summaryText || '' }}></div>
                    </div>

                    <div>
                        <CspSandboxOptions options={policy.sandboxOptions} disabled={!isEditable} update={setSandboxOptions}></CspSandboxOptions>
                        <Divider orientation="left">Policy</Divider>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
            </Modal>
        </>
    )
}

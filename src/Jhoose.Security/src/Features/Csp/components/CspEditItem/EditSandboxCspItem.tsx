import React, { useEffect, useState, useMemo } from 'react';

import { CspSandboxPolicy, SandboxOptions } from '../../Types/types';
import { CspSandboxOptions } from '../../components/CspSandboxOptions';
import { getSandboxOptionsDisplay } from '../../lib/helpers';
import { Divider, Flex, Modal, message } from 'antd';
import { getErrorMessage, useUpdateCspPolicyMutation } from '../../lib/cspQueries';
import { ContentSecurityPolicyData } from '../../Data/ContentSecurityPolicies';

type Props = {  
    isOpen: boolean,
    policy: CspSandboxPolicy,
    onClose: () => void
}

export function EditSandboxCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
    const [messageApi, contextHolder] = message.useMessage();
    const updatePolicyMutation = useUpdateCspPolicyMutation();

    const title = `Edit Policy`;

    useEffect(() => {
        if (updatePolicyMutation.error) {
            messageApi.error(getErrorMessage(updatePolicyMutation.error));
        }
    }, [messageApi, updatePolicyMutation.error]);

    function setSandboxOptions(options: SandboxOptions){

        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: {...options},
        }

        setPolicy(newPolicy);
    }

    const handleOk = () => {
        updatePolicyMutation.mutate(policy, {
            onSuccess: () => props.onClose(),
        });
    };
    
    const handleCancel = () => {
        props.onClose();
    };

    const calculatedPolicy = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return(
        <>
        {contextHolder}
        <Modal
            destroyOnClose
            title={title}
            open={props.isOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={"75vw"}
            >
                <Flex vertical>
                    <div>
                        <h3>{policy.policyName}</h3>

                        <div className="summary" dangerouslySetInnerHTML={{__html: ContentSecurityPolicyData[policy.policyName]?.summaryText || ''}}></div>
                    </div>

                    <div>
                        <CspSandboxOptions options={policy.sandboxOptions} update={setSandboxOptions}></CspSandboxOptions>
                        <Divider orientation="left">Policy</Divider>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
        </Modal>
        </>
    )
}

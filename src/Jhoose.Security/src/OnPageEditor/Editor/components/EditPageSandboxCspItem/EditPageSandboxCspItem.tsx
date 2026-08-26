import React, { useEffect, useMemo, useState } from 'react';

import { CspSandboxPolicy, SandboxOptions } from '../../../../Features/Csp/Types/types';
import { CspSandboxOptions } from '../../../../Features/Csp/components/CspSandboxOptions/CspSandboxOptions';
import { getSandboxOptionsDisplay } from '../../../../Features/Csp/lib/helpers';
import { Divider, Flex, Modal } from 'antd';
import { ContentSecurityPolicyData } from '../../../../Features/Csp/Data/ContentSecurityPolicies';

type Props = {
    isOpen: boolean,
    policy: CspSandboxPolicy,
    contentLink: string,
    onSave: (policy: CspSandboxPolicy) => void,
    onClose: () => void
}

export function EditPageSandboxCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);

    const title = `Edit Page Policy`;

    useEffect(() => {
        setPolicy(props.policy);
    }, [props.policy, props.isOpen]);

    function setSandboxOptions(options: SandboxOptions) {
        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: { ...options },
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
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return (
        <>
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
                    <div>
                        <h3>{policy.policyName}</h3>

                        <div className="summary" dangerouslySetInnerHTML={{ __html: ContentSecurityPolicyData[policy.policyName]?.summaryText || '' }}></div>
                    </div>

                    <div>
                        <CspSandboxOptions options={policy.sandboxOptions} disabled={false} update={setSandboxOptions}></CspSandboxOptions>
                        <Divider orientation="left">Policy</Divider>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
            </Modal>
        </>
    )
}

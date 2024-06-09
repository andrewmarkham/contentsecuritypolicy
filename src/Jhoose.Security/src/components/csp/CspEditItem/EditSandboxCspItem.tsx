import React, { useState, useMemo } from 'react';

import { CspPolicy, CspSandboxPolicy, PolicyOptions, SandboxOptions, SchemaSource } from '../types/types';
import { CspSandboxOptions } from '../CspSandboxOptions';
import { getSandboxOptionsDisplay } from '../helpers';
import { Flex, Modal } from 'antd';

type Props = {  
    isOpen: boolean,
    policy: CspSandboxPolicy,
    onClose: () => void
}

export function EditSandboxCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
    
    const [value, setValue] = useState(policy.value);

    const title = `Edit Policy`;

    function setSandboxOptions(options: SandboxOptions){

        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: {...options},
        }

        setPolicy(newPolicy);
    }

    const handleOk = () => {
        //setConfirmLoading(true);
        //formRef.current?.RequestSave();
        props.onClose();
    };
    
    const handleCancel = () => {
        props.onClose();
    };

    const calculatedPolicy = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions,value]);

    return(
        <Modal
            destroyOnClose
            title={title}
            open={props.isOpen}
            onOk={handleOk}
            //confirmLoading={confirmLoading}
            onCancel={handleCancel}
            width={"75vw"}
            >
                <Flex vertical>
                    <div>
                        <h3>{policy.policyName}</h3>
                        <div className="summary" dangerouslySetInnerHTML={{__html: policy.summaryText}}></div>
                    </div>

                    <div>
                        <CspSandboxOptions options={policy.sandboxOptions} update={setSandboxOptions}></CspSandboxOptions>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
        </Modal>
    )
}


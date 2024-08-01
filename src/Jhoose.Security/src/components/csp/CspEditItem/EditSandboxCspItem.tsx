import React, { useState, useMemo, useContext } from 'react';

import { CspSandboxPolicy, SandboxOptions } from '../types/types';
import { CspSandboxOptions } from '../CspSandboxOptions';
import { getSandboxOptionsDisplay } from '../helpers';
import { Divider, Flex, Modal } from 'antd';
import { AppContext } from '../../../context';

type Props = {  
    isOpen: boolean,
    policy: CspSandboxPolicy,
    onClose: () => void
}

export function EditSandboxCspItem(props: Props) {

    const [policy, setPolicy] = useState(props.policy);
    const { dispatch } = useContext(AppContext);

    const title = `Edit Policy`;

    function setSandboxOptions(options: SandboxOptions){

        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: {...options},
        }

        setPolicy(newPolicy);
    }

    const handleOk = () => {
        dispatch({
            cspPolicy: policy , 
            actionType: "save", 
            dispatcher: dispatch} );
        props.onClose();
    };
    
    const handleCancel = () => {
        props.onClose();
    };

    const calculatedPolicy = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return(
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
                        <div className="summary" dangerouslySetInnerHTML={{__html: policy.summaryText}}></div>
                    </div>

                    <div>
                        <CspSandboxOptions options={policy.sandboxOptions} update={setSandboxOptions}></CspSandboxOptions>
                        <Divider orientation="left">Policy</Divider>
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
                </Flex>
        </Modal>
    )
}


import React, { useState, useMemo, } from 'react';

import { CspOptions } from '../CspOptions';

import { CspSchemaSources } from '../CspSchemaSources';
import { CspPolicy, PolicyOptions, SchemaSource } from '../types/types';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay, isScriptPolicy as _isScriptPolicy } from '../helpers';
import { Checkbox, Flex, Input, Modal } from 'antd';


type Props = {  
    isOpen: boolean,
    policy: CspPolicy,
    onClose: () => void
}

export function EditDefaultCspItem(props: Props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [policy, setPolicy] = useState(props.policy);
    
    const [value, setValue] = useState(policy.value);

    const title = `Edit Policy`;

    const { TextArea } = Input;

    function setOptions(options: PolicyOptions){
        var newPolicy : CspPolicy = {
            ...policy,
            options: {...options},
            schemaSource: {...policy.schemaSource},
        }
        setPolicy(newPolicy);
    }

    function setSchemaSource(schemaSource: SchemaSource){
        var newPolicy: CspPolicy = {
            ...policy,
            options: {...policy.options},
            schemaSource: {...schemaSource}
        }
        setPolicy(newPolicy);
    }
    
    function setPolicyValue(key: string, value: string ) {
        var newPolicy: CspPolicy = {
            ...policy,
            options: {...policy.options},
            schemaSource: {...policy.schemaSource}
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
        //setConfirmLoading(true);
        //formRef.current?.RequestSave();
        props.onClose();
    };
    
    const handleCancel = () => {
        props.onClose();
    };

    const calculatedPolicy = useMemo(() => {
        return `${policy.policyName} ${getPolicyOptionsDisplay(policy)} ${getSchemaSourceDisplay(policy)}`;
    }, [policy.options,policy.schemaSource,value]);

    const  isScriptPolicy = useMemo(() => {
        return _isScriptPolicy(policy);
    }, [policy.policyName]);

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
                    <div >
                        <fieldset>
                            <legend>Mode</legend>
                            <Checkbox checked={policy.reportOnly} onChange={(e) => {
                                setPolicyValue("mode", e.target.value);
                        }}>Report Only</Checkbox>
                        </fieldset>
                    </div>
                    <div >
                        <CspOptions 
                            options={policy.options}
                            showScriptOptions={isScriptPolicy}
                            update={setOptions}
                            ></CspOptions>
                    </div>
                    <div >
                        <CspSchemaSources schemaSource={policy.schemaSource} update={setSchemaSource}></CspSchemaSources>
                    </div>

                    <div>
                        <TextArea 
                            rows={4} 
                            disabled={policy.options?.none ?? true} 
                            placeholder='Host Source'
                            onChange={(e) => {
                                setPolicyValue("value",e.currentTarget.value);
                            }} />
                        <pre className='summary'>{calculatedPolicy}</pre>
                    </div>
            </Flex>
        </Modal>
    )
}


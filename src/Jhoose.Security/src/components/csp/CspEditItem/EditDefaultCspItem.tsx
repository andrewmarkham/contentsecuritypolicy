import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox,TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";
import { CspOptions } from '../CspOptions';

import { CspSchemaSources } from '../CspSchemaSources';
import { CspPolicy, PolicyOptions, SchemaSource } from '../types/types';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay, isScriptPolicy as _isScriptPolicy } from '../helpers';

type Props = {  
    isOpen: boolean,
    policy: CspPolicy,
    onClose: (e: any, callback: any) => void
}

export function EditDefaultCspItem(props: Props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [policy, setPolicy] = useState(props.policy);
    
    const [value, setValue] = useState(policy.value);

    const title = `Edit Policy`;

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

    const calculatedPolicy = useMemo(() => {
        return `${policy.policyName} ${getPolicyOptionsDisplay(policy)} ${getSchemaSourceDisplay(policy)}`;
    }, [policy.options,policy.schemaSource,value]);

    const  isScriptPolicy = useMemo(() => {
        return _isScriptPolicy(policy);
    }, [policy.policyName]);

    return(
        <Dialog className="editDialog" open={isOpen}
            title={title}
            dismissLabel="Cancel"
            confirmLabel="OK"
            enableConfirm={true}
            onInteraction={(e) => props.onClose(e, () => {
                return policy;
            })}>
                <>
                <GridRow>
                    <GridCell span={12}>
                        <h3>{policy.policyName}</h3>
                        <div className="summary" dangerouslySetInnerHTML={{__html: policy.summaryText}}></div>
                    </GridCell>
                    <GridCell span={12}>
                        <fieldset>
                            <legend>Mode</legend>
                            <Checkbox checked={policy.reportOnly} onChange={(e) => {
                            setPolicyValue("mode", e.currentTarget.value);
                        }}>Report Only</Checkbox>
                        </fieldset>
                    </GridCell>
                    <GridCell span={12}>
                        <CspOptions 
                            options={policy.options}
                            showScriptOptions={isScriptPolicy}
                            update={setOptions}
                            ></CspOptions>
                    </GridCell>
                    <GridCell span={12}>
                        <CspSchemaSources schemaSource={policy.schemaSource} update={setSchemaSource}></CspSchemaSources>
                    </GridCell>
                </GridRow>
                <GridRow>
                    <GridCell span={12}>
                        <TextField
                            disabled={policy.options?.none ?? true} 
                            label="Host Source"
                            className="fullwidth"
                            textarea
                            outlined
                            value={value}
                            onChange={(e) => {
                                setPolicyValue("value",e.currentTarget.value);
                            }}/>
                        <pre>{calculatedPolicy}</pre>
                    </GridCell>
                </GridRow>
                </>
        </Dialog>
    )
}


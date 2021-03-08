import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox,TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";
import { CspOptions } from './CspOptions';
import { SchemaSource } from './SchemaSource';

export function EditCspItem(props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [policy, setPolicy] = useState(props.policy);
    
    const [value, setValue] = useState(policy.value);

    const title = `Edit Policy`;

    function setOptions(options){

        var newPolicy = {
            ...policy,
            options: {...options},
            schemaSource: {...policy.schemaSource}
        }

        setPolicy(newPolicy);
    }

    function setSchemaSource(schemaSource){

        var newPolicy = {
            ...policy,
            options: {...policy.options},
            schemaSource: {...schemaSource}
        }

        setPolicy(newPolicy);
    }
    
    function setPolicyValue(key, value) {
        var newPolicy = {
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

        var v = `${policy.policyName} `;

        if (policy.options.none) {
            v+= "'none'";
        } else 
        {
            // options
            v = policy.options.wildcard ? v+= "* " : v;
            v = policy.options.self ? v+= "'self' " : v;

            v = policy.options.unsafeEval ? v+= "'unsafe-eval' " : v;
            v = policy.options.unsafeHashes ? v+= "'unsafe-hashes' " : v;
            v = policy.options.unsafeInline ? v+= "'unsafe-inline' " : v;
            v = policy.options.strictDynamic ? v+= "'strict-dynamic' " : v;
            v = policy.options.nonce ? v+= "'nonce-<base64-value>' " : v;

            //schemaSource
            v = policy.schemaSource.http ? v+= "http: " : v;
            v = policy.schemaSource.https ? v+= "https: " : v;
            v = policy.schemaSource.data ? v+= "data: " : v;
            v = policy.schemaSource.mediastream ? v+= "mediastream: " : v;
            v = policy.schemaSource.blob ? v+= "blob: " : v;
            v = policy.schemaSource.filesystem ? v+= "filesystem: " : v;
      
            v+= value;
        }

        return v;

    }, [policy.options,policy.schemaSource,value]);

    const  isScriptPolicy = useMemo(() => {

        if(policy.policyName === "script-src" | policy.policyName === "style-src") {
            return true;
        }        

        return false;

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
                        <SchemaSource 
                            schemaSource={policy.schemaSource}
                            update={setSchemaSource}>
                            </SchemaSource>
                    </GridCell>
                </GridRow>
                <GridRow>
                    <GridCell span={12}>
                        <TextField
                            disabled={policy.options.none} 
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
        </Dialog>
    )
}


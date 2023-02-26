import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox,TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";
import { CspOptions } from './CspOptions';
import { SandboxOptions } from './SandboxOptions';

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
            sandboxOptions: {...policy.sandboxOptions},
            schemaSource: {...policy.schemaSource}
        }

        setPolicy(newPolicy);
    }

    function isEmpty(obj) {
        return Object.keys(obj ?? {}).length === 0;
    }

    function setSandboxOptions(options){

        var newPolicy = {
            ...policy,
            options: null,
            sandboxOptions: {...options},
            schemaSource: null
        }

        setPolicy(newPolicy);
    }

    function setSchemaSource(schemaSource){

        var newPolicy = {
            ...policy,
            options: {...policy.options},
            sandboxOptions: null,
            schemaSource: {...schemaSource}
        }

        setPolicy(newPolicy);
    }
    
    function setPolicyValue(key, value) {
        var newPolicy = {
            ...policy,
            options: {...policy.options},
            sandboxOptions: null,
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

        if (policy.options?.none) {
            v+= "'none'";
        } else 
        {
            // options
            v = policy.options?.wildcard ? v+= "* " : v;
            v = policy.options?.self ? v+= "'self' " : v;

            v = policy.options?.unsafeEval ? v+= "'unsafe-eval' " : v;
            v = policy.options?.unsafeHashes ? v+= "'unsafe-hashes' " : v;
            v = policy.options?.unsafeInline ? v+= "'unsafe-inline' " : v;
            v = policy.options?.strictDynamic ? v+= "'strict-dynamic' " : v;
            v = policy.options?.nonce ? v+= "'nonce-<base64-value>' " : v;

            // sandboxOptions
            if (policy.sandboxOptions?.enabled ?? false) {
                v = policy.sandboxOptions?.allowForms ? v+= "allow-forms " : v;
                v = policy.sandboxOptions?.allowSameOrigin ? v+= "allow-same-origin " : v;
                v = policy.sandboxOptions?.allowScripts ? v+= "allow-scripts " : v;
                v = policy.sandboxOptions?.allowPopups ? v+= "allow-popups " : v;
                v = policy.sandboxOptions?.allowModals ? v+= "allow-modals " : v;
                v = policy.sandboxOptions?.allowOrientationLock ? v+= "allow-orientation-lock " : v;
                v = policy.sandboxOptions?.allowPointerLock ? v+= "allow-pointer-lock " : v;
                v = policy.sandboxOptions?.allowPresentation ? v+= "allow-presentation " : v;
                v = policy.sandboxOptions?.allowPopupsToEscapeSandbox ? v+= "allow-popups-to-escape-sandbox " : v;
                v = policy.sandboxOptions?.allowTopNavigation ? v+= "allow-top-navigation " : v;
                v = policy.sandboxOptions?.allowTopNavigationByUserActivation ? v+= "allow-top-navigation-by-user-activation " : v;
            }
            //schemaSource
            v = policy.schemaSource?.http ? v+= "http: " : v;
            v = policy.schemaSource?.https ? v+= "https: " : v;
            v = policy.schemaSource?.data ? v+= "data: " : v;
            v = policy.schemaSource?.mediastream ? v+= "mediastream: " : v;
            v = policy.schemaSource?.blob ? v+= "blob: " : v;
            v = policy.schemaSource?.filesystem ? v+= "filesystem: " : v;
      
            v = policy.schemaSource?.ws ? v+= "ws: " : v;
            v = policy.schemaSource?.wss ? v+= "wss: " : v;

            v+= value ?? "";
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
                    { !isEmpty(policy.options) &&
                    <>
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
                    </>
                    }
                    {!isEmpty(policy.sandboxOptions) &&
                        <>
                            <GridCell span={12}>
                                <SandboxOptions 
                                    options={policy.sandboxOptions}
                                    update={setSandboxOptions}
                                ></SandboxOptions>
                            </GridCell>
                        </>
                    }
                </GridRow>
                <GridRow>
                    <GridCell span={12}>
                        {!isEmpty(policy.options) &&
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
                        }
                        <pre>{calculatedPolicy}</pre>
                    </GridCell>
                </GridRow>
        </Dialog>
    )
}


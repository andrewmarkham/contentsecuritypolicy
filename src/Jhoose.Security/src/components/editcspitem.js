import React, { useState, useMemo } from 'react';
import { Checkbox,TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";

export function EditCspItem(props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const {policy} = {...props};
    
    const [value, setValue] = useState(policy.value);

    const [none, setNone] = useState(policy.options.none);
    const [wildcard, setWildcard] = useState(policy.options.wildcard);
    const [data, setData] = useState(policy.options.data);
    const [self, setSelf] = useState(policy.options.self);

    const title = `Edit Policy`;

    function setPolicyValue(key, value){

        console.log(`key:  ${key} value:  ${value}`)

        switch (key) {
            case "value":
                setValue(value);
                break;
            
            case "none":
                setNone(!none);
                break;

            case "wildcard":
                setWildcard(!wildcard);
                break;

            case "self":
                setSelf(!self);
                break;

            case "data":
                setData(!data);
                break;
            default:
                break;
        }
    };

    const calculatedPolicy = useMemo(() => {

        var v = `${policy.policyName} `;

        if (none) {
            v+= "'none'";
        } else 
        {
            v = wildcard ? v+= "* " : v;
            v = data ? v+= "data: " : v;
            v = self ? v+= "'self' " : v;

            v+= value;
        }

        return v;

    }, [none,wildcard,data,self,value]);


    return(
        <Dialog open={isOpen}
            title={title}
            dismissLabel="Cancel"
            confirmLabel="OK"
            enableConfirm={true}
            onInteraction={(e) => props.onClose(e, () => {

                var newPolicy = Object.assign(policy, { value: value});
                newPolicy.options.none = none;
                newPolicy.options.wildcard = wildcard;
                newPolicy.options.self = self;
                newPolicy.options.data = data;

                return newPolicy;
            })}>

                <GridRow>
                    <GridCell span={12}>
                        <h3>{policy.policyName}</h3>
                        <div dangerouslySetInnerHTML={{__html: policy.summaryText}}></div>
                    </GridCell>
                </GridRow>
                <GridRow>
                    <GridCell span={12}>
                        <fieldset>
                        <legend>Options</legend>
                            <GridRow>
                                <GridCell span={6}>
                                    <Checkbox checked={none} onChange={(e) => {
                                            setPolicyValue("none", e.currentTarget.value);
                                        }}>None</Checkbox>
                                </GridCell>
                                <GridCell span={6}>
                                    <Checkbox disabled={none} checked={wildcard} onChange={(e) => {
                                            setPolicyValue("wildcard", e.currentTarget.value);
                                        }}>Wildcard</Checkbox>
                                </GridCell>
                            </GridRow>
                            <GridRow>
                                <GridCell span={6}>
                                    <Checkbox disabled={none}  checked={self} onChange={(e) => {
                                            setPolicyValue("self", e.currentTarget.value);
                                        }}>Self</Checkbox>
                                </GridCell>
                                <GridCell span={6}>
                                    <Checkbox disabled={none} checked={data} onChange={(e) => {
                                            setPolicyValue("data", e.currentTarget.value);
                                        }}>Data</Checkbox>
                                </GridCell>
                            </GridRow>
                        </fieldset>
                    </GridCell>
                </GridRow>
                <GridRow>
                    <GridCell span={12}>
                        <TextField
                            disabled={none} 
                            label="Policy Value"
                            className="fullwidth"
                            textarea
                            outlined
                            value={value}
                            onChange={(e) => {
                                setPolicyValue("value", e.currentTarget.value);
                            }}/>
                        <pre>{calculatedPolicy}</pre>
                    </GridCell>
                </GridRow>
        </Dialog>
    )
}
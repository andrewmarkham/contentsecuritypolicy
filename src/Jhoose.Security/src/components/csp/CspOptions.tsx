import React, { useState } from 'react';
import { Checkbox, GridCell, GridRow } from "@episerver/ui-framework";
import { PolicyOptionName, PolicyOptions } from './types/types';

type Props = {  
    options: PolicyOptions,
    update: any,
    showScriptOptions: boolean
}
export function CspOptions(props: Props) {

    var [options, setOptions] = useState<PolicyOptions>(props.options);

    function setPolicyValue(key:string, value: string) {

        var newOptions: PolicyOptions = { ...options };

        var oldVal : boolean = options[key as keyof PolicyOptions];
        newOptions[key as keyof PolicyOptions] = !oldVal;

        setOptions(newOptions);
        props.update(newOptions);
    };

    return (<fieldset>
        <legend>Options</legend>
        <GridRow>
            <GridCell span={12}>
                <Checkbox checked={options.nonce} onChange={(e) => {
                    setPolicyValue("none", e.currentTarget.value);
                }}>None</Checkbox>
            </GridCell>
            <>
            {!options.none &&
                <>
                    <GridCell span={3}>
                        <Checkbox checked={options.wildcard} onChange={(e) => {
                            setPolicyValue("wildcard", e.currentTarget.value);
                        }}>Wildcard</Checkbox>
                    </GridCell>
                    <GridCell span={3}>
                        <Checkbox checked={options.self} onChange={(e) => {
                            setPolicyValue("self", e.currentTarget.value);
                        }}>Self</Checkbox>
                    </GridCell>
                    {props.showScriptOptions &&
                    <>
                    <GridCell span={3}>
                        <Checkbox checked={options.nonce} onChange={(e) => {
                            setPolicyValue("nonce", e.currentTarget.value);
                        }}>Nonce</Checkbox>
                    </GridCell>
                    <GridCell span={3}>
                        <Checkbox checked={options.unsafeEval} onChange={(e) => {
                            setPolicyValue("unsafeEval", e.currentTarget.value);
                        }}>Unsafe Eval</Checkbox>
                    </GridCell>
                    <GridCell span={3}>
                        <Checkbox disabled={options.none} checked={options.unsafeHashes} onChange={(e) => {
                            setPolicyValue("unsafeHashes", e.currentTarget.value);
                        }}>Unsafe Hashes</Checkbox>
                    </GridCell>
                    <GridCell span={3}>
                        <Checkbox checked={options.unsafeInline} onChange={(e) => {
                            setPolicyValue("unsafeInline", e.currentTarget.value);
                        }}>Unsafe Inline</Checkbox>
                    </GridCell>
                    <GridCell span={3}>
                        <Checkbox checked={options.strictDynamic} onChange={(e) => {
                            setPolicyValue("strictDynamic", e.currentTarget.value);
                        }}>Strict Dynamic</Checkbox>
                    </GridCell>
                    </>}
                </>}
            </>
        </GridRow>

    </fieldset>);
}

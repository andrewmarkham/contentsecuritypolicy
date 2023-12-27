import React, { useState } from 'react';
import { Checkbox, GridCell, GridRow } from "@episerver/ui-framework";

export function CspOptions(props) {

    var [options, setOptions] = useState(props.options);

    function setPolicyValue(key, value) {

        var newOptions = { ...options };

        newOptions[key] = !options[key];

        setOptions(newOptions);
        props.update(newOptions);
    };

    return (<fieldset>
        <legend>Options</legend>
        <GridRow>
            <GridCell span={12}>
                <Checkbox checked={options.none} onChange={(e) => {
                    setPolicyValue("none", e.currentTarget.value);
                }}>None</Checkbox>
            </GridCell>
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
        </GridRow>

    </fieldset>);
}

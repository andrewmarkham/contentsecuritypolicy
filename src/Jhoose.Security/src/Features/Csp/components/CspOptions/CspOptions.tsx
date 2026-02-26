import React, { useEffect, useState } from 'react';

import { PolicyOptions } from '../../Types/types';
import { Checkbox, Flex } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { FieldSet } from '../../../../components/FieldSet/FieldSet';

type Props = {
    options: PolicyOptions,
    update: any,
    showScriptOptions: boolean,
    disabled?: boolean
}
export function CspOptions(props: Props) {

    var [options, setOptions] = useState<PolicyOptions>(props.options);

    useEffect(() => {
        setOptions(props.options);
    }, [props.options]);

    function setPolicyValue(key: string) {

        var newOptions: PolicyOptions = { ...options };

        var oldVal: boolean = options[key as keyof PolicyOptions];
        newOptions[key as keyof PolicyOptions] = !oldVal;

        setOptions(newOptions);
        props.update(newOptions);
    };

    return (<FieldSet className="modal" legend="Options">
        <Flex gap="large" vertical>
            <div>
                <Checkbox disabled={props.disabled} checked={options.none} onChange={(e: CheckboxChangeEvent) => {
                    setPolicyValue("none");
                }}>None</Checkbox>
            </div>
            <Flex gap="large" wrap>
                <Checkbox disabled={props.disabled || options.none} checked={options.wildcard} onChange={() => {
                    setPolicyValue("wildcard");
                }}>Wildcard</Checkbox>

                <Checkbox disabled={props.disabled || options.none} checked={options.self} onChange={() => {
                    setPolicyValue("self");
                }}>Self</Checkbox>

                {props.showScriptOptions &&
                    <>

                        <Checkbox disabled={props.disabled || options.none} checked={options.nonce} onChange={() => {
                            setPolicyValue("nonce");
                        }}>Nonce</Checkbox>

                        <Checkbox disabled={props.disabled || options.none} checked={options.unsafeEval} onChange={() => {
                            setPolicyValue("unsafeEval");
                        }}>Unsafe Eval</Checkbox>

                        <Checkbox disabled={props.disabled || options.none} checked={options.wasmUnsafeEval} onChange={() => {
                            setPolicyValue("wasmUnsafeEval");
                        }}>Wasm Unsafe Eval</Checkbox>


                        <Checkbox disabled={props.disabled || options.none} checked={options.unsafeHashes} onChange={() => {
                            setPolicyValue("unsafeHashes");
                        }}>Unsafe Hashes</Checkbox>

                        <Checkbox disabled={props.disabled || options.none} checked={options.unsafeInline} onChange={(t) => {
                            setPolicyValue("unsafeInline");
                        }}>Unsafe Inline</Checkbox>


                        <Checkbox disabled={props.disabled || options.none} checked={options.strictDynamic} onChange={() => {
                            setPolicyValue("strictDynamic");
                        }}>Strict Dynamic</Checkbox>
                    </>}
            </Flex>
        </Flex>

    </FieldSet>);
}

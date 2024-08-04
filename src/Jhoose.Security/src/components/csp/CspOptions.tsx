import React, { useState } from 'react';

import { PolicyOptions } from './types/types';
import { Checkbox, Flex } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';

type Props = {  
    options: PolicyOptions,
    update: any,
    showScriptOptions: boolean
}
export function CspOptions(props: Props) {

    var [options, setOptions] = useState<PolicyOptions>(props.options);

    function setPolicyValue(key:string) {

        var newOptions: PolicyOptions = { ...options };

        var oldVal : boolean = options[key as keyof PolicyOptions];
        newOptions[key as keyof PolicyOptions] = !oldVal;

        setOptions(newOptions);
        props.update(newOptions);
    };

    return (<fieldset>
        <legend>Options</legend>
        <Flex gap="large" vertical>
            <div>
                <Checkbox checked={options.none} onChange={(e:CheckboxChangeEvent) => {
                    setPolicyValue("none");
                }}>None</Checkbox>
            </div>
            <Flex gap="large" wrap>
                    <Checkbox disabled={options.none} checked={options.wildcard} onChange={() => {
                        setPolicyValue("wildcard");
                    }}>Wildcard</Checkbox>

                    <Checkbox disabled={options.none} checked={options.self} onChange={() => {
                        setPolicyValue("self");
                    }}>Self</Checkbox>

                    {props.showScriptOptions &&
                    <>

                        <Checkbox disabled={options.none} checked={options.nonce} onChange={() => {
                            setPolicyValue("nonce");
                        }}>Nonce</Checkbox>
 
                        <Checkbox disabled={options.none} checked={options.unsafeEval} onChange={() => {
                            setPolicyValue("unsafeEval");
                        }}>Unsafe Eval</Checkbox>

                        <Checkbox disabled={options.none} checked={options.unsafeHashes} onChange={() => {
                            setPolicyValue("unsafeHashes");
                        }}>Unsafe Hashes</Checkbox>

                        <Checkbox disabled={options.none} checked={options.unsafeInline} onChange={(t) => {
                            setPolicyValue("unsafeInline");
                        }}>Unsafe Inline</Checkbox>


                        <Checkbox disabled={options.none} checked={options.strictDynamic} onChange={() => {
                            setPolicyValue("strictDynamic");
                        }}>Strict Dynamic</Checkbox>
                </>}
            </Flex>
        </Flex>

    </fieldset>);
}

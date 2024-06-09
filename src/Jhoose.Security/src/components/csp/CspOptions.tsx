import React, { useState } from 'react';

import { PolicyOptions } from './types/types';
import { Col, Row,Checkbox } from 'antd';
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
        <Row>
            <Col span={12}>
                <Checkbox checked={options.nonce} onChange={(e:CheckboxChangeEvent) => {
                    setPolicyValue("none");
                }}>None</Checkbox>
            </Col>
            <>
            {!options.none &&
                <>
                    <Col span={3}>
                        <Checkbox checked={options.wildcard} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("wildcard");
                        }}>Wildcard</Checkbox>
                    </Col>
                    <Col span={3}>
                        <Checkbox checked={options.self} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("self");
                        }}>Self</Checkbox>
                    </Col>
                    {props.showScriptOptions &&
                    <>
                    <Col span={3}>
                        <Checkbox checked={options.nonce} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("nonce");
                        }}>Nonce</Checkbox>
                    </Col>
                    <Col span={3}>
                        <Checkbox checked={options.unsafeEval} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("unsafeEval");
                        }}>Unsafe Eval</Checkbox>
                    </Col>
                    <Col span={3}>
                        <Checkbox disabled={options.none} checked={options.unsafeHashes} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("unsafeHashes");
                        }}>Unsafe Hashes</Checkbox>
                    </Col>
                    <Col span={3}>
                        <Checkbox checked={options.unsafeInline} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("unsafeInline");
                        }}>Unsafe Inline</Checkbox>
                    </Col>
                    <Col span={3}>
                        <Checkbox checked={options.strictDynamic} onChange={(e:CheckboxChangeEvent) => {
                            setPolicyValue("strictDynamic");
                        }}>Strict Dynamic</Checkbox>
                    </Col>
                    </>}
                </>}
            </>
        </Row>

    </fieldset>);
}

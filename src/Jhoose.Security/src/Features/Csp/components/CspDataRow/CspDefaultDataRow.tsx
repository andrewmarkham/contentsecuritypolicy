import React, { useMemo, useState } from 'react';

import { ContentSecurityPolicy, CspPolicy, CspSandboxPolicy, RowProps } from '../../Types/types';

import { getPolicyOptionsDisplay, getSchemaSourceDisplay } from '../../lib/helpers';
import { Cell } from "../../../../components/DataTable/Cell";
import { Row } from "../../../../components/DataTable/Row";
import { MutedOutlined } from '@ant-design/icons';
import { EditDefaultCspItem } from '../CspEditItem/EditDefaultCspItem';
import { v4 as uuidv4 } from 'uuid';


    
export function CspDataRow(props: RowProps) {

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [emptyPolicy] = useState(() => createEmptyPolicy(props.policyName));

    const policy = props.policy ?? emptyPolicy;

    const options = useMemo(() => {
        return getPolicyOptionsDisplay(policy);
    }, [policy?.options]);

    const schema = useMemo(() => {
        return getSchemaSourceDisplay(policy);
    }, [policy?.schemaSource]);

    return(
        <>
        <Row key={policy.policyName} >
            <Cell width="150px">
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>{policy.policyName}</button>
            </Cell>
            <Cell>{options}</Cell>
            <Cell>{schema}</Cell>
            <Cell>
                <>
                {policy.options?.none ? "" : policy?.value ?? ""}
                <EditDefaultCspItem 
                    key={policy.id} 
                    isOpen={isEditOpen} 
                    policy={policy} 
                    onClose={() => {
                        setIsEditOpen(false);
                    }}/>
                </>
            </Cell>
            <Cell width="100px" align='right'>
                {policy.reportOnly ? <span title="Configured as report only"><MutedOutlined /></span> : <></>}
            </Cell>
        </Row>
        </>
    );
}
function createEmptyPolicy(policyName: string): CspPolicy {
    return {
        id: uuidv4(),
        policyName,
        options: {
            wildcard: false,
            none: false,
            self: false,
            unsafeEval: false,
            wasmUnsafeEval: false,
            unsafeHashes: false,
            unsafeInline: false,
            strictDynamic: false,
            nonce: false,
        },
        schemaSource: {
            enabled: false,
            http: false,
            https: false,
            data: false,
            mediastream: false,
            blob: false,
            filesystem: false,
            ws: false,
            wss: false,
        },
        value: '',
        reportOnly: false,
    };
}

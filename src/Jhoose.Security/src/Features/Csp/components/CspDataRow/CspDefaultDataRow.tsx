import React, { useMemo, useState } from 'react';

import { CspPolicy, PolicySource, RowProps } from '../../Types/types';

import { getPolicyOptionsDisplay, getSchemaSourceDisplay } from '../../lib/helpers';
import { Cell } from "../../../../components/DataTable/Cell";
import { Row } from "../../../../components/DataTable/Row";
import { MutedOutlined } from '@ant-design/icons';
import { EditDefaultCspItem } from '../CspEditItem/EditDefaultCspItem';
import { v4 as uuidv4 } from 'uuid';
import { Tag } from 'antd';

export function CspDataRow(props: RowProps) {

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [emptyPolicy] = useState(() => createEmptyPolicy(props.policyName, props.siteId));

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
                    siteId={props.siteId}
                    siteName={props.siteName}
                    source={props.source}
                    inheritedPolicy={props.inheritedPolicy}
                    onClose={() => {
                        setIsEditOpen(false);
                    }}/>
                </>
            </Cell>
            <Cell width="70px">
                <SourceTag source={props.source} />
            </Cell>
            <Cell width="50px" align='right'>
                {policy.reportOnly ? <span title="Configured as report only"><MutedOutlined /></span> : <></>}
            </Cell>
        </Row>
        </>
    );
}
function createEmptyPolicy(policyName: string, siteId: string): CspPolicy {
    return {
        id: uuidv4(),
        policyName,
        site: siteId,
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

function SourceTag(props: { source: PolicySource }) {
    switch (props.source) {
        case "default":
            return <Tag color="blue">Global default</Tag>;
        case "overridden":
            return <Tag color="gold">Overridden</Tag>;
        default:
            return <Tag>Inherited</Tag>;
    }
}

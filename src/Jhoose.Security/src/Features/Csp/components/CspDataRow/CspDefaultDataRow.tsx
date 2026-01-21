import React, { useMemo, useState } from 'react';

import { CspPolicy } from '../../Types/types';

import { getPolicyOptionsDisplay, getSchemaSourceDisplay } from '../../lib/helpers';
import { Cell } from "../../../../components/DataTable/Cell";
import { Row } from "../../../../components/DataTable/Row";
import { MutedOutlined } from '@ant-design/icons';
import { EditDefaultCspItem } from '../CspEditItem/EditDefaultCspItem';

type Props = {  
    row: CspPolicy,
    save: (data: CspPolicy) => void
}

export function CspDataRow(props: Props) {

    const [isEditOpen, setIsEditOpen] = useState(false);

    const policy = props.row;

    const options = useMemo(() => {
        return getPolicyOptionsDisplay(policy);
    }, [policy.options]);

    const schema = useMemo(() => {
        return getSchemaSourceDisplay(policy);
    }, [policy.schemaSource]);

    return(
        <>
        <Row key={policy.id} >
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
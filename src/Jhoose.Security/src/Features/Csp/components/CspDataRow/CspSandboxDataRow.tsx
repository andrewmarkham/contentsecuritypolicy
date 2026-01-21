import React, { useMemo, useState } from 'react';
import { CspPolicy, CspSandboxPolicy } from '../../Types/types';

import { getSandboxOptionsDisplay } from '../../lib/helpers';
import { Cell } from "../../../../components/DataTable/Cell";
import { Row } from "../../../../components/DataTable/Row";
import { MutedOutlined } from '@ant-design/icons';
import { EditSandboxCspItem } from '../CspEditItem/EditSandboxCspItem';

type Props = {  
    row: CspSandboxPolicy,
    save: (data: CspPolicy) => void
}

export function CspSandboxDataRow(props: Props) {

    const [isEditOpen, setIsEditOpen] = useState(false);
    const policy = props.row;

    const options = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return(
        <>
        <Row key={policy.id} >
            <Cell width="150px">
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>{policy.policyName}</button>
            </Cell>
            <Cell>{options}</Cell>
            <Cell>&nbsp;</Cell>
            <Cell>       
                <EditSandboxCspItem 
                    key={policy.id} 
                    isOpen={isEditOpen} 
                    policy={policy} 
                    onClose={() => {
                        setIsEditOpen(false);
                    }}/>
            </Cell>
            <Cell width="100px" align='right'>
                {policy.reportOnly ? <span title="Configured as report only"><MutedOutlined /></span> : <></>}
            </Cell>
        </Row>
        </>
    );
}
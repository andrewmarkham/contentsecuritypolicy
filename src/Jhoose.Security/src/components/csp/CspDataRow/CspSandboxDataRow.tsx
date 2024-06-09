import React, { useMemo, useState } from 'react';
import { CspPolicy, CspSandboxPolicy } from '../types/types';
import { EditSandboxCspItem } from '../CspEditItem/EditSandboxCspItem';
import { getSandboxOptionsDisplay } from '../helpers';
import { Cell } from "../../DataTable/Cell";
import { Row } from "../../DataTable/Row";

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
        </Row>
        </>
    );
}
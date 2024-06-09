import React, { useMemo, useState } from 'react';

import { CspPolicy } from '../types/types';
import { EditDefaultCspItem } from '../CspEditItem/EditDefaultCspItem';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay } from '../helpers';
import { Cell } from "../../DataTable/Cell";
import { Row } from "../../DataTable/Row";

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
    
        </Row>
        </>
    );
}
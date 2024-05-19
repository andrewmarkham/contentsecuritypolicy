import React, { useMemo, useState } from 'react';
import { DataTableRow, DataTableCell } from "@episerver/ui-framework";
import { CspPolicy, CspSandboxPolicy } from '../types/types';
import { EditSandboxCspItem } from '../CspEditItem/EditSandboxCspItem';
import { getSandboxOptionsDisplay } from '../helpers';

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
        <DataTableRow key={policy.id} rowId={policy.id.toString()} >
            <DataTableCell>
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>{policy.policyName}</button>
            </DataTableCell>
            <DataTableCell>{options}</DataTableCell>
            <DataTableCell>&nbsp;</DataTableCell>
            <DataTableCell>       
                <EditSandboxCspItem 
                key={policy.id} 
                isOpen={isEditOpen} 
                policy={policy} 
                onClose={(e: any, p:any) => {

                    setIsEditOpen(false);

                    // ok, lets save the data
                    if (e.detail.action === "confirm") {
                        props.save(p());
                    }
                }}/>
            </DataTableCell>
             </DataTableRow>
        </>
    );
}
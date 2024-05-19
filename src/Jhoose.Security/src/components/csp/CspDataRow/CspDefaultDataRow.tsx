import React, { useMemo, useState } from 'react';
import { DataTableRow, DataTableCell } from "@episerver/ui-framework";
import { CspPolicy } from '../types/types';
import { EditDefaultCspItem } from '../CspEditItem/EditDefaultCspItem';
import { getPolicyOptionsDisplay, getSchemaSourceDisplay } from '../helpers';

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
        <DataTableRow key={policy.id} rowId={policy.id.toString()} >
            <DataTableCell>
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>{policy.policyName}</button>
            </DataTableCell>
            <DataTableCell>{options}</DataTableCell>
            <DataTableCell>{schema}</DataTableCell>
            <DataTableCell>
                <>
                {policy.options?.none ? "" : policy?.value ?? ""}
                <EditDefaultCspItem 
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
                </>
            </DataTableCell>
    
        </DataTableRow>
        </>
    );
}
import React, { useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody} from "@episerver/ui-framework";

import {CspDataRow} from './cspdatarow';
import { EditCspItem } from './editcspitem';

export function CspDataGrid(props) {

    const dummy = {id: -1, policyName: "", value:"", options: { wildcard: false, none: false, self: false, data: false  } };
    const {data, save} = {...props};
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [currentPolicy, setCurrentPolicy] = useState(dummy);

    return(
        <>
        <DataTable disabled={props.disabled} >
            {/*}
            <DataTableToolbar>
                <DataTableToolbarPrimaryActions>

                </DataTableToolbarPrimaryActions>
            </DataTableToolbar>
            */}
            <DataTableContent>
                <DataTableHeaderRow>
                    <DataTableColumnHeaderCell>
                        Policy
                    </DataTableColumnHeaderCell>
                    <DataTableColumnHeaderCell>
                        Options
                    </DataTableColumnHeaderCell>
                    <DataTableColumnHeaderCell>
                        Value
                    </DataTableColumnHeaderCell>
                </DataTableHeaderRow>

                <DataTableBody>
                    {data.map(r => {
                        return <CspDataRow 
                                    key={r.id}  
                                    row={r} 
                                    onClick={() => {
                                        setCurrentPolicy(r);
                                        setIsEditOpen(true);
                                    }}
                                    />
                    })}
                </DataTableBody>
            </DataTableContent>
        </DataTable>
        <EditCspItem 
            key={currentPolicy.id} 
            isOpen={isEditOpen} 
            policy={currentPolicy} 
            onClose={(e, p) => {

                setIsEditOpen(false);
                setCurrentPolicy(dummy);

                // ok, lets save the data
                if (e.detail.action === "confirm") {
                    save(p());
                }
            }}/>
        </>
    );
}




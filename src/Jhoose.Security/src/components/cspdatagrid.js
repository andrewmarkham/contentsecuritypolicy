import React, { useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody} from "@episerver/ui-framework";

import {CspDataRow} from './cspdatarow';
import { EditCspItem } from './editcspitem';

export function CspDataGrid(props) {

    const dummy = { "id": "a5780475-6944-429d-bf5c-ac417d274e11", "policyName": "default-src","reportOnly": false, 
        "schemaSource": null, 
        "value": "", 
        "options": null, 
        "summaryText": "<p>The default-src directive defines the default policy for fetching resources such as JavaScript, Images, CSS, Fonts, AJAX requests, Frames, HTML5 Media. Not all directives fallback to default-src.</p>" }; 
    
    const {data, save} = {...props};
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [currentPolicy, setCurrentPolicy] = useState(dummy);

    return(
        <>
        <DataTable disabled={props.disabled} >
            <DataTableContent>
                <DataTableHeaderRow>
                    <DataTableColumnHeaderCell>
                        Policy
                    </DataTableColumnHeaderCell>
                    <DataTableColumnHeaderCell>
                        Options
                    </DataTableColumnHeaderCell>
                    <DataTableColumnHeaderCell>
                        Schema
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




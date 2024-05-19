import React, { useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody} from "@episerver/ui-framework";

import {CspDataRow} from './CspDataRow/CspDefaultDataRow';
import {CspSandboxDataRow} from './CspDataRow/CspSandboxDataRow';

import { CspPolicy, CspSandboxPolicy } from './types/types';

type Props = {
    data: Array<CspPolicy | CspSandboxPolicy>,
    save: (data: CspPolicy) => void,
    disabled: boolean
}

export function CspDataGrid(props: Props) {

    /*
    const dummy: CspPolicy = { "id": "a5780475-6944-429d-bf5c-ac417d274e11", "policyName": "default-src","reportOnly": false, 
        "schemaSource": { "enabled": false, "http": false, "https": false, "data": false, "mediastream": false, "blob": false, "filesystem": false }, 
        "value": "", 
        "options": { "wildcard": false, "none": false, "self": false, "unsafeEval": false, "unsafeHashes": false, "unsafeInline": false, "strictDynamic": false, "nonce": false }, 
        "summaryText": "<p>The default-src directive defines the default policy for fetching resources such as JavaScript, Images, CSS, Fonts, AJAX requests, Frames, HTML5 Media. Not all directives fallback to default-src.</p>" }; 
    */

    const {data} = {...props};

    return(
        <DataTable /*disabled={props.disabled}*/ >
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
                    <>
                    {data?.map(r => {
                        return (r.policyName !== "sandbox"  ?
                            <CspDataRow key={r.id} row={r as CspPolicy} save={props.save}/> :
                            <CspSandboxDataRow key={r.id} row={r as CspSandboxPolicy} save={props.save} /> )
                    })}
                    </>
                </DataTableBody>
            </DataTableContent>
        </DataTable>
    );
}




import React, { useEffect, useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody, DataTableRow, DataTableCell, Checkbox, Typography, ExposedDropdownMenu, GridRow, GridCell } from "@episerver/ui-framework";
import { EditSecurityHeader } from './EditSecurityHeader';
import { getLabelForHeaderOption } from './SecurityHeaderHelper';

import { SecurityHeader } from './types/securityHeader';

type Props = {
    data: SecurityHeader[],
    disabled: boolean,
    save: (data: any) => void,
    setTitle: (title: string) => void
}

export function SecurityHeaders(props: Props) {

    const dummy = { "id": "-1", "name": "", "enabled": true, "mode": 0, "value": "" };

    const [isEditOpen, setIsEditOpen] = useState(false);

    const [currentHeader, setCurrentHeader] = useState<SecurityHeader>(dummy);

    function getValue(row: SecurityHeader): string  {

        if (row.name === "X-Content-Type-Options") {
            return row.value ?? "";
        }

        if (row.name === "Strict-Transport-Security") { 
            return `includeSubDomains : ${row.includeSubDomains}; maxage : ${row.maxAge}`
        }
        
        if (row.name === "X-Frame-Options") { 

            var modelLabel = getLabelForHeaderOption(row.name, row.mode);

            if (row.domain != null && row.domain !== "") 
                return `${modelLabel}; domain : ${row.domain}`;
            else
                return modelLabel ?? "";
        }

        if (row.mode !== undefined) {
            return getLabelForHeaderOption(row.name, row.mode);
        }

        return "";
    }

    useEffect(() => {
        props.setTitle("Security Headers")
    })


    return (
        <div className="tab-container">
                <DataTable>
                    <DataTableContent>
                        <DataTableHeaderRow>
                            <DataTableColumnHeaderCell>
                                Header
                            </DataTableColumnHeaderCell>
                            <DataTableColumnHeaderCell>
                                Configuration
                            </DataTableColumnHeaderCell>
                        </DataTableHeaderRow>

                        <DataTableBody>
                            {props.data?.map((r : SecurityHeader) => {
                                return (
                                    <DataTableRow rowId={r.id} key={r.id}>
                                        <DataTableCell>
                                            <button className="linkButton" onClick={() => {
                                                setCurrentHeader(r);
                                                setIsEditOpen(true);
                                            }}>{r.name}</button>
                                        </DataTableCell>
                                        <DataTableCell>{getValue(r)}</DataTableCell>
                                    </DataTableRow>
                                );
                            })}
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>


                <EditSecurityHeader
                    key={currentHeader.id}
                    isOpen={isEditOpen}
                    header={currentHeader}
                    onClose={(e, p) => {

                        console.log("Closing");

                        setIsEditOpen(false);
                        setCurrentHeader(dummy);

                        // ok, lets save the data
                        if (e.detail.action === "confirm") {
                            props.save(p());
                        }
                    }} />
        </div>
    );
}




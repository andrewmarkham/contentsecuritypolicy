import React, { useEffect, useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody, DataTableRow, DataTableCell, Checkbox, Typography, ExposedDropdownMenu, GridRow, GridCell } from "@episerver/ui-framework";
import { EditSecurityHeader } from './EditSecurityHeader';
import { getLabelForHeaderOption } from './SecurityHeaderHelper';
import { ErrorBoundary } from '../errorBoundry';

export function SecurityHeaders(props) {

    const dummy = { "id": "-1", "name": "", "enabled": true, "mode": 0, "value": "" };

    const { data, save } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [currentHeader, setCurrentHeader] = useState(dummy);

    function getValue(row) {

        const { mode, includeSubDomains, maxAge, domain } = { ...row };

        if (row.name === "X-Content-Type-Options") {
            return row.value;
        }

        if (row.name === "Strict-Transport-Security") { 
            return `includeSubDomains : ${includeSubDomains}; maxage : ${maxAge}`
        }
        
        if (row.name === "X-Frame-Options") { 

            var modelLabel = getLabelForHeaderOption(row.name, mode);

            if (domain != null) 
                return `${modelLabel}; domain : ${domain}`;
            else
                return modelLabel;
        }

        if (mode != "undefined") {
            return getLabelForHeaderOption(row.name, mode);
        }
    }

    useEffect(() => {
        props.setTitle("Security Headers")
    })


    return (
        <>
                <ErrorBoundary>
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
                            {data?.map(r => {
                                return (
                                    <DataTableRow key={r.id}>
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
                </ErrorBoundary>

                <ErrorBoundary>
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
                            save(p());
                        }
                    }} />
                    </ErrorBoundary>

            
        </>
    );
}




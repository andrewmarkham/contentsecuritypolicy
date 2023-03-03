import React, { useState } from 'react';
import { DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody, DataTableRow, DataTableCell , Checkbox, Typography, ExposedDropdownMenu , GridRow, GridCell} from "@episerver/ui-framework";
import {EditSecurityHeader} from './EditSecurityHeader';

export function SecurityHeaders(props) {

    const dummy = { "id": -1, "header": "", "enabled": true, "mode": 0, "label": "" };

    const {data, save} = {...props};
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [currentHeader, setCurrentHeader] = useState(dummy);

    const divStyle = {
        width: '40px'
      };

    function getValue(row) {

        const {label, includeSubDomains, maxage, domain} = {...row};

        if (typeof(label) === "undefined") {

            if (typeof(domain) === "undefined") {
                return `includeSubDomains : ${includeSubDomains} maxage : ${maxage}`
            }

            return domain;
        }

        return label;
    }

    return(
        <>
        <h2>Edit Security Headers</h2>
        <DataTable>
            <DataTableContent>
                <DataTableHeaderRow>
                    <DataTableColumnHeaderCell style={divStyle}>
                        &nbsp;
                    </DataTableColumnHeaderCell>
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
                                <DataTableCell style={divStyle}>
                                    <Checkbox disabled={true} 
                                        checked={r.enabled}
                                        ></Checkbox>
                                </DataTableCell>
                                <DataTableCell>
                                    <button className="linkButton" onClick={() => {
                                            setCurrentHeader(r);
                                            setIsEditOpen(true);
                                            console.log(r.header);
                                        }}>{r.header}</button>
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
                    save(p());
                }
            }}/>
        </>
    );
}




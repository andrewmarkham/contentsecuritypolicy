import React, { useMemo } from 'react';
import { DataTableRow, DataTableCell } from "@episerver/ui-framework";

export function CspDataRow(props) {

    const row = props.row;

    const options = useMemo(() => {

        var o = "";
        if (row.options.none) {
            return "'none'";
        }
        o+= row.options.wildcard ? "* " : "";
        o+= row.options.self ? "'self' " : "";
        o+= row.options.data ? "data: " : "";
        
        return o;
    });

    return(
        <DataTableRow key={row.id} rowid={row.id.toString()} >
            <DataTableCell>
                <a href='#' onClick={props.onClick}>{row.policyName}</a>
            </DataTableCell>
            <DataTableCell>{options}</DataTableCell>
            <DataTableCell>{row.options.none ? "" : row.value}</DataTableCell>
        </DataTableRow>
    );
}
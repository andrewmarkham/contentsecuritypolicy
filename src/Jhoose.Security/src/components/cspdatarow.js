import React, { useMemo } from 'react';
import { DataTableRow, DataTableCell } from "@episerver/ui-framework";

export function CspDataRow(props) {

    const policy = props.row;

    const options = useMemo(() => {

        var v = "";

        if (policy.options.none) {
            v+= "'none'";
        } else 
        {
            // options
            v = policy.options.wildcard ? v+= "* " : v;
            v = policy.options.self ? v+= "'self' " : v;

            v = policy.options.unsafeEval ? v+= "'unsafe-eval' " : v;
            v = policy.options.unsafeHashes ? v+= "'unsafe-hashes' " : v;
            v = policy.options.unsafeInline ? v+= "'unsafe-inline' " : v;
            v = policy.options.strictDynamic ? v+= "'strict-dynamic' " : v;
            v = policy.options.nonce ? v+= "'nonce-<base64-value>' " : v;
        }

        return v;
    });

    const schema = useMemo(() => {

        var v = "";

        //schemaSource
        v = policy.schemaSource.http ? v+= "http: " : v;
        v = policy.schemaSource.https ? v+= "https: " : v;
        v = policy.schemaSource.data ? v+= "data: " : v;
        v = policy.schemaSource.mediastream ? v+= "mediastream: " : v;
        v = policy.schemaSource.blob ? v+= "blob: " : v;
        v = policy.schemaSource.filesystem ? v+= "filesystem: " : v;

        return v;
    });

    return(
        <DataTableRow key={policy.id} rowid={policy.id.toString()} >
            <DataTableCell>
                <button className="linkButton" onClick={props.onClick}>{policy.policyName}</button>
            </DataTableCell>
            <DataTableCell>{options}</DataTableCell>
            <DataTableCell>{schema}</DataTableCell>
            <DataTableCell>{policy.options.none ? "" : policy.value}</DataTableCell>
        </DataTableRow>
    );
}
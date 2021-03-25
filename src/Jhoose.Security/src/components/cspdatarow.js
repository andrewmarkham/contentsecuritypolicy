import React, { useMemo } from 'react';
import { DataTableRow, DataTableCell } from "@episerver/ui-framework";

export function CspDataRow(props) {

    const policy = props.row;

    const options = useMemo(() => {

        var v = "";

        if (policy.options)
        {
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
        }

        // sandboxOptions
        if (policy.sandboxOptions?.enabled ?? false) {
            v = policy.sandboxOptions?.allowForms ? v+= "allow-forms " : v;
            v = policy.sandboxOptions?.allowSameOrigin ? v+= "allow-same-origin " : v;
            v = policy.sandboxOptions?.allowScripts ? v+= "allow-scripts " : v;
            v = policy.sandboxOptions?.allowPopups ? v+= "allow-popups " : v;
            v = policy.sandboxOptions?.allowModals ? v+= "allow-modals " : v;
            v = policy.sandboxOptions?.allowOrientationLock ? v+= "allow-orientation-lock " : v;
            v = policy.sandboxOptions?.allowPointerLock ? v+= "allow-pointer-lock " : v;
            v = policy.sandboxOptions?.allowPresentation ? v+= "allow-presentation " : v;
            v = policy.sandboxOptions?.allowPopupsToEscapeSandbox ? v+= "allow-popups-to-escape-sandbox " : v;
            v = policy.sandboxOptions?.allowTopNavigation ? v+= "allow-top-navigation " : v;
            v = policy.sandboxOptions?.allowTopNavigationByUserActivation ? v+= "allow-top-navigation-by-user-activation " : v;
        }
        
        return v;
    });

    const schema = useMemo(() => {

        var v = "";

        if (policy.schemaSource)
        {
            //schemaSource
            v = policy.schemaSource.http ? v+= "http: " : v;
            v = policy.schemaSource.https ? v+= "https: " : v;
            v = policy.schemaSource.data ? v+= "data: " : v;
            v = policy.schemaSource.mediastream ? v+= "mediastream: " : v;
            v = policy.schemaSource.blob ? v+= "blob: " : v;
            v = policy.schemaSource.filesystem ? v+= "filesystem: " : v;
        }

        return v;
    });

    return(
        <DataTableRow key={policy.id} rowid={policy.id.toString()} >
            <DataTableCell>
                <button className="linkButton" onClick={props.onClick}>{policy.policyName}</button>
            </DataTableCell>
            <DataTableCell>{options}</DataTableCell>
            <DataTableCell>{schema}</DataTableCell>
            <DataTableCell>{policy.options?.none ? "" : policy?.value ?? ""}</DataTableCell>
        </DataTableRow>
    );
}
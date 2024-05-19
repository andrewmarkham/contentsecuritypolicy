import React, { useState, useMemo } from 'react';
import { Dialog, GridCell, GridRow } from "@episerver/ui-framework";

import { CspPolicy, CspSandboxPolicy, PolicyOptions, SandboxOptions, SchemaSource } from '../types/types';
import { CspSandboxOptions } from '../CspSandboxOptions';
import { getSandboxOptionsDisplay } from '../helpers';

type Props = {  
    isOpen: boolean,
    policy: CspSandboxPolicy,
    onClose: (e: any, callback: any) => void
}

export function EditSandboxCspItem(props: Props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [policy, setPolicy] = useState(props.policy);
    
    const [value, setValue] = useState(policy.value);

    const title = `Edit Policy`;

    function setSandboxOptions(options: SandboxOptions){

        var newPolicy: CspSandboxPolicy = {
            ...policy,
            sandboxOptions: {...options},
        }

        setPolicy(newPolicy);
    }

    const calculatedPolicy = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions,value]);

    return(
        <Dialog className="editDialog" open={isOpen}
            title={title}
            dismissLabel="Cancel"
            confirmLabel="OK"
            enableConfirm={true}
            onInteraction={(e) => props.onClose(e, () => {
                return policy;
            })}>
                <GridRow>
                    <GridCell span={12}>
                        <h3>{policy.policyName}</h3>
                        <div className="summary" dangerouslySetInnerHTML={{__html: policy.summaryText}}></div>
                    </GridCell>

                    <GridCell span={12}>
                        <CspSandboxOptions options={policy.sandboxOptions} update={setSandboxOptions}></CspSandboxOptions>
                        <pre>{calculatedPolicy}</pre>
                    </GridCell>

                </GridRow>
        </Dialog>
    )
}


import React, { useMemo, useState } from 'react';
import { CspSandboxPolicy, PolicySource, SandboxRowProps } from '../../Types/types';

import { getSandboxOptionsDisplay } from '../../lib/helpers';
import { Cell } from "../../../../components/DataTable/Cell";
import { Row } from "../../../../components/DataTable/Row";
import { MutedOutlined } from '@ant-design/icons';
import { EditSandboxCspItem } from '../CspEditItem/EditSandboxCspItem';
import { v4 as uuidv4 } from 'uuid';
import { Tag } from 'antd';


export function CspSandboxDataRow(props: SandboxRowProps) {

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [emptyPolicy] = useState(() => createEmptyPolicy(props.policyName, props.siteId));
    const policy = props.policy ?? emptyPolicy;

    const options = useMemo(() => {
        return getSandboxOptionsDisplay(policy);
    }, [policy.sandboxOptions]);

    return(
        <>
        <Row key={props.policyName} >
            <Cell width="150px">
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>{policy.policyName}</button>
            </Cell>
            <Cell>{options}</Cell>
            <Cell>&nbsp;</Cell>
            <Cell>       
                <EditSandboxCspItem 
                    key={policy.id} 
                    isOpen={isEditOpen} 
                    policy={policy} 
                    siteId={props.siteId}
                    siteName={props.siteName}
                    source={props.source}
                    inheritedPolicy={props.inheritedPolicy}
                    onClose={() => {
                        setIsEditOpen(false);
                    }}/>
            </Cell>
            <Cell width="70px">
                <SourceTag source={props.source} />
            </Cell>
            <Cell width="50px" align='right'>
                {policy.reportOnly ? <span title="Configured as report only"><MutedOutlined /></span> : <></>}
            </Cell>
        </Row>
        </>
    );
}
function createEmptyPolicy(policyName: string, siteId: string): CspSandboxPolicy {
    return {
        id: uuidv4(),
        policyName,
        site: siteId,
        sandboxOptions: {
            enabled: false,
            allowDownloads: false,
            allowForms: false,
            allowModals: false,
            allowOrientationLock: false,
            allowPointerLock: false,
            allowPopups: false,
            allowPopupsToEscapeSandbox: false,
            allowPresentation: false,
            allowSameOrigin: false,
            allowScripts: false,
            allowTopNavigation: false,
            allowTopNavigationByUserActivation: false,
            allowTopNavigationToCustomProtocols: false,
        },
        value: '',
        reportOnly: false
    };
}

function SourceTag(props: { source: PolicySource }) {
    switch (props.source) {
        case "default":
            return <Tag color="blue">Global default</Tag>;
        case "overridden":
            return <Tag color="gold">Overridden</Tag>;
        default:
            return <Tag>Inherited</Tag>;
    }
}

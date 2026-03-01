import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined, MutedOutlined } from '@ant-design/icons';

import { Permission, PermissionPolicy, PermissionSource } from '../../Types/types';
import { Cell } from '../../../../components/DataTable/Cell/Cell';
import { Row } from '../../../../components/DataTable/Row/Row';
import { RenderPermission } from '../RenderPermission/RenderPermission';
import { EditPermissionItem } from '../PermissionEditItem/EditPermissionItem/EditPermissionItem';
import './PermissionDataRow.css';

type Props = {
    policy: PermissionPolicy,
    permissionRecord: Permission,
    source: PermissionSource,
    siteId: string,
    siteName: string,
    inheritedPermission: Permission,
    defaultAllowlist: string,
    description: string,
    compatibility?: React.ReactNode,
    sourceTag: React.ReactNode
};

export function PermissionDataRow(props: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <Row>
            <Cell width="250px">
                <button className="linkButton" onClick={() => setIsEditOpen(true)}>
                    {props.policy.name}
                </button>
                {props.policy.notes && props.policy.notes !== "" && (
                    <Tooltip placement="topLeft" title={props.policy.notes}>
                        <InfoCircleOutlined/>
                    </Tooltip>
                )}
            </Cell>
            <Cell width="300px">
                <Tooltip placement="topLeft" title={props.description}>
                    <div className="permission-data-row__description">
                        {props.description}
                    </div>
                </Tooltip>
            </Cell>
            <Cell>
                <RenderPermission
                    permission={props.permissionRecord}
                    defaultValue={props.defaultAllowlist}
                    isListing={true}
                />
            </Cell>
            <Cell width="70px">
                {props.sourceTag}
            </Cell>
            <Cell width="50px" align="right">
                {props.permissionRecord.mode === "report" ? (
                    <span title="Configured as report only"><MutedOutlined /></span>
                ) : null}
                <EditPermissionItem
                    isOpen={isEditOpen}
                    permission={props.permissionRecord}
                    source={props.source}
                    siteId={props.siteId}
                    siteName={props.siteName}
                    inheritedPermission={props.inheritedPermission}
                    defaultAllowlist={props.defaultAllowlist}
                    description={props.description}
                    compatibility={props.compatibility}
                    onClose={() => setIsEditOpen(false)}
                />
            </Cell>
        </Row>
    );
}

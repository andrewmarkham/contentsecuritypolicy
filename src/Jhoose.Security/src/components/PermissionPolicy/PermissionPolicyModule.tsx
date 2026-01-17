
import React, { useEffect, useState } from 'react';

import { Tooltip, Typography } from 'antd';
import { Table } from '../DataTable/Table';
import { Cell } from '../DataTable/Cell';
import { Header } from '../DataTable/Header';
import { CollapsiblePanel } from '../CollapsiblePanel/CollapsiblePanel';
import { PermissionPolicy,Permission } from './types';

import { PermissionPolicyData, browserDetails } from './Data/PermissionPolicyData';
import { CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleOutlined, MutedOutlined } from '@ant-design/icons';

import bcd, { Identifier } from '@mdn/browser-compat-data' 
import { PermissionEditor } from './PermissionEditor';
import { Toaster } from '../Toaster';
import { RenderPermission } from './RenderPermission';



export function PermissionPolicyModule() {

    const { Title, Text } = Typography;

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const permissionPolicy = bcd.http["headers"]["Permissions-Policy"];
    const permissionPolicyRecords = permissionPolicy as Record<string, Identifier | undefined>;

    useEffect(() => {
        const fetchData = async () => {
            const data = await loadPermissionsData();
            setPermissions(data);
        };
        fetchData();
    }, []);

    return(
        <>
            <Toaster show={isLoading} message={"Loading..." } />
            <div className="title">
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <div style={{maxWidth: "60%"}}>
                        <Title level={1}>Permissions Policy</Title>
                            <p>The <span style={{
                                display: 'inline-block',
                                fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                                backgroundColor: '#f6f8fa',
                                color: '#24292f',
                                borderRadius: '4px',
                                border: '1px solid rgba(27, 31, 35, 0.15)',
                                padding: '2px 6px',
                                fontSize: '12px',
                                lineHeight: 1.6,
                                marginBottom: '6px'
                            }}>Permission-Policy</span> is not supported by all browsers</p>
                            <p>Read this <a href='https://developer.chrome.com/docs/privacy-security/permissions-policy' target='_blank' rel="noopener noreferrer">guide</a> from Google for more information about how to implement the Permissions Policy.</p>
                    </div>
                    <PermissionCompatibilityHeaderMatrix data={permissionPolicy} />
                </div>


                <Table>
                        <Header>
                            <Cell width="250px">Permission</Cell>
                            <Cell width="600px">Description</Cell>
                            <Cell>Configuration</Cell>
                        </Header>

                        {PermissionPolicyData.map((permission : PermissionPolicy) => {
                            const compatibilityData = permissionPolicyRecords[permission.name];
                            const permissionRecord = permissions.find(p => p.key === permission.name);
                            return (
                                <React.Fragment key={permission.name}>
                                    <CollapsiblePanel
                                        header={
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <div style={{width: "250px", flexShrink: 0}}>
                                                    <Text style={{marginRight: "5px", display: "inline-block"}}>{permission.name}</Text>
                                                    {permission.notes && permission.notes !== "" && (
                                                    <Tooltip placement="topLeft" title={permission.notes}>
                                                        <InfoCircleOutlined/>
                                                    </Tooltip>
                                                )}
                                                </div>
                                                <Text style={{width: "590px", marginRight: "10px", flexShrink: 0}}>{permission.description}</Text>
                                                <div style={{flexGrow: 1, display: "-webkit-box", overflow: "hidden", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"  }}>
                                                    <RenderPermission permission={permissionRecord} defaultValue={permission.defaultAllowlist} isListing={true} />
                                                </div>
                                            </div>
                                        }
                                        className="permission-policy__panel">
                                        <PermissionEditor data={permissionRecord || {
                                                key: permission.name,
                                                mode: "default"
                                            } as Permission}
                                            default={permission.defaultAllowlist}
                                            />
                                        <PermissionCompatibilityMatrix data={compatibilityData} />
                                    </CollapsiblePanel>
                                </React.Fragment>
                            );
                        })}

                </Table>
            </div>
        </>

    );

    async function loadPermissionsData(): Promise<Permission[]> {
        setIsLoading(true);
        return fetch('/api/jhoose/permissions')
            .then(response => response.json())
            .then(data => {
                setIsLoading(false);
                return data as Permission[];
            })
            .catch(error => {
                console.error('Error fetching permissions data:', error);
                return [];
            });
    }
}
const PermissionCompatibilityMatrix: React.FC<{ data?: Identifier }> = ({ data }) => {

    const supportData = data?.__compat?.support;
    if (!supportData) {
        return <div>No compatibility data available.</div>;
    }

    return (
        <div style={{display: "flex", flexDirection: "row", margin: "15px 0", borderTop: "1px solid #f0f0f0", paddingTop: "10px"}}>
            <p style={{margin: "0 10px 0 0",textAlign: "center", lineHeight: "16px", fontSize: "14px"}}>Browser Compatibility</p>
            {Object.entries(supportData).map(([browser, support]) => {

                const versionAdded: number | boolean = (support as any).version_added;
                if (versionAdded === false) return null;

                return (
                    <div style={{marginRight: "10px"}} key={browser}>
                        <Tooltip key={browser} placement="topLeft" title={`Avaliable since version ${versionAdded}`}>
                            <p style={{fontSize: "12px", lineHeight: "16px", textAlign: "center", margin: 0, display: "flex", alignItems: "center", flexDirection: "row"}}>
                                <img
                                    src={browserDetails[browser].logoUrl}
                                    alt={browserDetails[browser].name}
                                    style={{ width: '16px', height: '16px', marginRight: '5px' }}
                                />
                                {browserDetails[browser].name}
                            </p>
                        </Tooltip>
                    </div>
                );
            })}
        </div>
    );
}


const PermissionCompatibilityHeaderMatrix: React.FC<{ data?: Identifier }> = ({ data }) => {
    const supportData = data?.__compat?.support;
    if (!supportData) {
        return <div>No compatibility data available.</div>;
    }

    return (
        <div style={{marginTop: "26px", marginBottom: "10px"}}>
            <div style={{ display: 'flex', flexWrap: 'wrap', padding: '1px 0 0 1px', boxSizing: 'border-box' }}>
                {Object.entries(supportData).map(([browser, support]) => {
                    const browserInfo = browserDetails[browser];
                    if (!browserInfo) {
                        return null;
                    }

                    const versionAdded: number | boolean = (support as any).version_added;

                    return (
                        <div
                            key={browser}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                border: '1px solid black',
                                marginLeft: '-1px',
                                marginTop: '-1px',
                                padding: '5px',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                textAlign: 'center'
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '12px'
                                }}
                            >
                                {browserInfo.name}
                            </p>
                            <img
                                src={browserInfo.logoUrl}
                                alt={browserInfo.name}
                                style={{ width: '16px', height: '16px', margin: '4px 0' }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {versionAdded === false ? <CloseCircleTwoTone twoToneColor="red" /> : <CheckCircleTwoTone twoToneColor="green" />}
                            </span>
                        </div>
                    );
                })}
            </div>
            <p>Supported browser matix</p>
        </div>
    );
}

import React from 'react';
import { RenderDefaultPermission } from './RenderDefaultPermission';
import { Permission } from './types';


export const RenderPermission: React.FC<{ permission: Permission | undefined; defaultValue: string; isListing: boolean }> = ({ permission, defaultValue, isListing }) => {

    var permissionStyling  = {};
    if (!isListing) {
        permissionStyling = {
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
                            };
    } else {
        permissionStyling = {fontSize: "14px"};
    }

    var permissionDisplay;
    switch (permission?.mode) {
        case "enabled":
            if (permission.scope === "all") {
                permissionDisplay = `${permission.key}=*`;
            } else {
                const allowlist = permission.allowlist && permission.allowlist.length > 0 ? " " + permission.allowlist.map(item => `"${item}"`).join(" ") : "";
                permissionDisplay = `${permission.key}=(self${allowlist})`;
            }
            break;
        case "disabled":
            permissionDisplay = `${permission.key}=()`;
            break;
        case "default":
        default:
            permissionDisplay = `default`;
            break;
    }

    return (
        <>
            {permission === undefined || permission.mode === "default" ? (
                <RenderDefaultPermission defaultValue={defaultValue} permissionStyling={permissionStyling}   />
            ) : (
                <div style={{margin: "0 10px"}}>
                    <p style={permissionStyling}>{permissionDisplay}</p>
                </div>
            )}
        </>
    );
};

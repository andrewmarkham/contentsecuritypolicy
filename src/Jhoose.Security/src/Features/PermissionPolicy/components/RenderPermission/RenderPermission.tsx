import React from 'react';
import { RenderDefaultPermission } from '../RenderDefaultPermission/RenderDefaultPermission';
import { Permission } from '../../Types/types';
import './RenderPermission.css';


export const RenderPermission: React.FC<{ permission: Permission | undefined; defaultValue: string; isListing: boolean }> = ({ permission, defaultValue, isListing }) => {

    const valueClassName = isListing ? "" : "render-permission__value";

    var permissionDisplay;
    switch (permission?.mode) {
        case "enabled":
        case "report":
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
                <RenderDefaultPermission defaultValue={defaultValue} valueClassName={valueClassName} />
            ) : (
                <div className="render-permission__wrapper">
                    <p className={valueClassName}>{permissionDisplay}</p>
                </div>
            )}
        </>
    );
};

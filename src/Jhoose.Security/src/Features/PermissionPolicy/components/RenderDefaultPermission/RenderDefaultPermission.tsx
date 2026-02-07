import React from 'react';


export const RenderDefaultPermission: React.FC<{ defaultValue: string; permissionStyling: any }> = ({ defaultValue, permissionStyling }) => {
    return (
        <div style={{margin: "0 10px"}}>
            <p style={permissionStyling}>Using default configuration: {defaultValue}</p>
        </div>
    );
};

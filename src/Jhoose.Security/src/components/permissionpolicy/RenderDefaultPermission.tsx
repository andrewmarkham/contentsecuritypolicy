import React from 'react';


export const RenderDefaultPermission: React.FC<{ defaultValue: string; permissionStyling: any }> = ({ defaultValue, permissionStyling }) => {
    return (
        <div>
            <p style={permissionStyling}>Using default configuration: {defaultValue}</p>
        </div>
    );
};

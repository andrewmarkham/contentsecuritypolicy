import React from 'react';
import './RenderDefaultPermission.css';

export const RenderDefaultPermission: React.FC<{ defaultValue: string; valueClassName?: string }> = ({ defaultValue, valueClassName }) => {
    return (
        <div className="render-default-permission__wrapper">
            <p className={valueClassName}>Using default configuration: {defaultValue}</p>
        </div>
    );
};

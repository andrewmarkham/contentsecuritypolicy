import React, { ReactNode } from 'react';

interface FieldSetProps {
    legend?: string;
    children: ReactNode;
    className?: string;
}

export const FieldSet: React.FC<FieldSetProps> = ({
    legend,
    children,
    className = '',
}) => {
    return (
        <fieldset className={`fieldset ${className}`.trim()}>
            {legend && <legend>{legend}</legend>}
            {children}
        </fieldset>
    );
};
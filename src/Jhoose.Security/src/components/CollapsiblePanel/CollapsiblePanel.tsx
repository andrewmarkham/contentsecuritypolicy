import React, { PropsWithChildren, ReactNode, useCallback, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';

import './collapsiblePanel.css';

export type CollapsiblePanelProps = {
    header: ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    onToggle?(expanded: boolean): void;
};

export function CollapsiblePanel(props: PropsWithChildren<CollapsiblePanelProps>) {
    const {
        header,
        defaultExpanded = false,
        className,
        headerClassName,
        contentClassName,
        onToggle,
        children
    } = props;

    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

    const toggle = useCallback(() => {
        setIsExpanded((previous) => {
            const next = !previous;
            if (onToggle) {
                onToggle(next);
            }
            return next;
        });
    }, [onToggle]);

    const rootClassName = ['collapsible-panel', className].filter(Boolean).join(' ');
    const headerClassNames = ['collapsible-panel__header', headerClassName].filter(Boolean).join(' ');
    const contentClassNames = ['collapsible-panel__content', contentClassName].filter(Boolean).join(' ');

    return (
        <div className={rootClassName}>
            <button
                type="button"
                onClick={toggle}
                className={headerClassNames}
                aria-expanded={isExpanded}
            >
                <div className="collapsible-panel__header-body">
                    {header}
                </div>
                <span
                    className={`collapsible-panel__icon ${isExpanded ? 'collapsible-panel__icon--expanded' : ''}`}
                    aria-hidden="true"
                >
                    <RightOutlined />
                </span>
            </button>
            {isExpanded && (
                <div className={contentClassNames}>
                    {children}
                </div>
            )}
        </div>
    );
}

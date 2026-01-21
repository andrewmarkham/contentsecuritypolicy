import React, { PropsWithChildren } from "react";

export type IssueBoxProps = {
    title?: string;
    fixed? : boolean;
    grow?: boolean;
    className?: string;
}

export const IssueBox = (props: PropsWithChildren<IssueBoxProps>) => {

    const className = `issue-box ${props.fixed ? 'fixed' : ''} ${props.grow ? 'grow' : ''} ${props.className}`;
    return (
        <div className={className} title={props.title}>
            {props.children}
        </div>
    );
};

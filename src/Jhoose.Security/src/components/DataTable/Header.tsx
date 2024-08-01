import React from "react";
import { PropsWithChildren } from "react";
import { RowProps } from "./types";

export function Header(props: PropsWithChildren<RowProps>) {
    return (
        <div className="jrow header">
            {props.children}
        </div>
    );
}

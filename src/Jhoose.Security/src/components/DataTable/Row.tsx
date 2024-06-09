import React from "react";
import { PropsWithChildren } from "react";
import { RowProps } from "./types";

export function Row(props: PropsWithChildren<RowProps>) {
    return (
        <div className="row">
            {props.children}
        </div>
    );
}

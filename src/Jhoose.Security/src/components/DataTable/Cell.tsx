import React from "react";
import { PropsWithChildren } from "react";
import { CellProps } from "./types";


export function Cell(props: PropsWithChildren<CellProps>) {

    const divStyle = {
        width: props.width ?? undefined,
    };

    var cellType = props.width ? "fixedCell" : "cell";
    return (
        <div className={`${cellType} ${props.align ?? "left"}`} style={divStyle}>
            {props.children}
        </div>
    );
}

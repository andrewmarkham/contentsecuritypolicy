import React from "react"
import { PropsWithChildren } from "react"
import { TableProps } from "./types"
import './table.css'


export function Table(props: PropsWithChildren<TableProps>) {
    return (
        <div className="table">
            {props.children}
        </div>
    )
}



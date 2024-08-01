import React from "react";

import { Button } from 'antd';

export function ApplicationKeyAdd(props: { disabled: boolean; handleAdd: () => void; }) {

    return (
        <div className="toolBar">
            <Button type="primary" disabled={props.disabled} onClick={() => props.handleAdd()}>Add New Api Key</Button>
        </div>
    );
}

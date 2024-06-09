import { Button } from "antd";
import React from "react";

type Props = {
    disabled: boolean,
    handleAdd: () => void
}
export function WebHookAdd(props: Props) {
    return (
        <div className="toolBar">
            <Button type="primary" disabled={props.disabled} onClick={() => props.handleAdd()}>Add New Webhook</Button>
        </div>
    );
}

import React from "react";
import { TextButton } from "@episerver/ui-framework";


type Props = {
    disabled: boolean,
    handleAdd: () => void
}
export function WebHookAdd(props: Props) {
    return (
        <div>
            <TextButton disabled={props.disabled} onClick={() => props.handleAdd()}>Add New Webhook</TextButton>
        </div>
    );
}

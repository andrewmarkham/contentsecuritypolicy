import React from "react";
import { IconButton, CancelIcon, CheckIcon } from "@episerver/ui-framework";


type Props = {
    item: string,
    index: number,
    handleDelete: (action: boolean, index: number) => void
}
export function WebHookInlineDelete(props: Props) {
    const { item, index } = { ...props };

    function handleDelete(action: boolean) {
        props.handleDelete(action, index);
    }
    return (
        <>
            <span className="italic bold">{item}</span> <span> - Are you sure you want to delete this webhook?</span>

            <IconButton title="Delete" className='iconButton' icon={<CheckIcon />} onClick={() => handleDelete(true)} />
            <IconButton title="Cancel" className='iconButton' icon={<CancelIcon />} onClick={() => handleDelete(false)} />
        </>
    );
}

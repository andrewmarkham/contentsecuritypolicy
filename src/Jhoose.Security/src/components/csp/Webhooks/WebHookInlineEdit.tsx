import React, { useState } from "react";
import { IconButton, CancelIcon, CheckIcon, TextField } from "@episerver/ui-framework";

type Props = {
    item: string,
    isNewRecord: boolean,
    handleUpdate: (action: string, value: string) => void
}

export function WebHookInlineEdit(props: Props) {
    const { item, isNewRecord } = { ...props };
    const [hasError, setHasError] = useState(false);
    const [newValue, setNewValue] = useState(item);

    function isValidUrl(newValue :string) {

        var res = newValue.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        if (res == null)
            return false;


        else
            return true;
    }

    function handleUpdate(action: string, value: string) {

        if (action === 'UPDATE') {
            if (isValidUrl(value))
                props.handleUpdate(action, value);


            else
                setHasError(true);
        }

        else if (isNewRecord)
            props.handleUpdate('CANCELADD', '');


        else
            props.handleUpdate('CANCEL', '');
    }

    return (
        <>
            <TextField
                className="wide-text"
                outlined
                defaultValue={item}
                invalid={hasError}
                required={true}
                type="url"
                onChange={(e) => { setNewValue(e.target.value); }} />

            <IconButton title="Update" className='iconButton' icon={<CheckIcon />} onClick={(e) => handleUpdate('UPDATE', newValue)} />
            <IconButton title="Cancel" className='iconButton' icon={<CancelIcon />} onClick={() => handleUpdate('CANCEL', '')} />
        </>
    );
}

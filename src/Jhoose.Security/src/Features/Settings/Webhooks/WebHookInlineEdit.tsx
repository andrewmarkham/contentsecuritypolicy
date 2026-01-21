import React, { useState } from "react";

import { Button, Input } from 'antd';
import {CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';

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
        <div className="flex">
            <div>
                <Input
                    className="wide-text"
                    defaultValue={item}
                    status={hasError ? '' : 'error'}
                    required={true}
                    type="url"
                    onChange={(e) => { setNewValue(e.target.value); }} />
                <span className="error-message" style={{ display: hasError ? 'block' : 'none' }}>Invalid URL</span>
            </div>
            <Button title="Update" className='iconButton' icon={<CheckCircleFilled />} onClick={(e) => handleUpdate('UPDATE', newValue)}>Update</Button>
            <Button title="Cancel" className='iconButton' icon={<CloseCircleFilled />} onClick={() => handleUpdate('CANCEL', '')}>Cancel</Button>
        </div>
    );
}

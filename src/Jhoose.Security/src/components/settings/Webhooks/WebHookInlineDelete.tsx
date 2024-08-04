import React from "react";

import { Button } from 'antd';
import {CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';

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
        <div>
            <span className="italic bold">{item}</span> <span> - Are you sure you want to delete this webhook?</span>

            <Button title="Delete" className='iconButton' icon={<CheckCircleFilled />} onClick={() => handleDelete(true)}>Delete</Button>
            <Button title="Cancel" className='iconButton' icon={<CloseCircleFilled />} onClick={() => handleDelete(false)}>Cancel</Button>
        </div>
    );
}

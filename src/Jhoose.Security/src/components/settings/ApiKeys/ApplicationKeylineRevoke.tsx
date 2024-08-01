import React from "react";

import { Button } from 'antd';
import {CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';

export function ApplicationKeylineRevoke(props: { disabled: boolean; index: number; handleRevoke: (action: boolean, index: number) => void; }) {

    function handleRevoke(action: boolean) {
        props.handleRevoke(action, props.index);
    }

    return (
        <div>
            <span> - Are you sure you want to revoke this API key?</span>

            <Button disabled={props.disabled} title="Revoke" className='iconButton' icon={<CheckCircleFilled style={{color: 'green'}} />} onClick={() => handleRevoke(true)} >Revoke</Button>
            <Button disabled={props.disabled} title="Cancel" className='iconButton' icon={<CloseCircleFilled style={{color: 'red'}}  />} onClick={() => handleRevoke(false)} >Cancel</Button>
        </div>
    );
}

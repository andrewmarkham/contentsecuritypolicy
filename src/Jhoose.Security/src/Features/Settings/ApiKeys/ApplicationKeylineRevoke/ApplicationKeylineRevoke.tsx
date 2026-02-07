import React from "react";

import { Button } from 'antd';
import {CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import './ApplicationKeylineRevoke.css';

export function ApplicationKeylineRevoke(props: { disabled: boolean; index: number; handleRevoke: (action: boolean, index: number) => void; }) {

    function handleRevoke(action: boolean) {
        props.handleRevoke(action, props.index);
    }

    return (
        <div>
            <span> - Are you sure you want to revoke this API key?</span>

            <Button disabled={props.disabled} title="Revoke" className='iconButton' icon={<CheckCircleFilled className="application-key-revoke__icon application-key-revoke__icon--confirm" />} onClick={() => handleRevoke(true)} >Revoke</Button>
            <Button disabled={props.disabled} title="Cancel" className='iconButton' icon={<CloseCircleFilled className="application-key-revoke__icon application-key-revoke__icon--cancel" />} onClick={() => handleRevoke(false)} >Cancel</Button>
        </div>
    );
}

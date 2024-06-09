import React, { useState } from "react";

import { Button, Input } from 'antd';
import {CloseCircleFilled, CheckCircleFilled, DeleteFilled } from '@ant-design/icons';

import { AuthenticationKey } from "../types/types";
import { ApplicationKeylineRevoke } from "./ApplicationKeylineRevoke";
import { Cell } from "../../DataTable/Cell";
import { Row } from "../../DataTable/Row";


export function ApplicationKeyItem(props: { item: AuthenticationKey; index: number; isNewRecord: boolean; isAddOpen: boolean; handleUpdate: (index: number, value: string) => void; handleDelete: (index: number) => void; handleRevoke: (index: number) => void; }) {
    const { item, index, isNewRecord } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [isNameValid, setIsNameValid] = useState(true);

    function handleUpdate(action: string, value: string) {
        setIsEditOpen(false);

        if (action === 'UPDATE') {
            props.handleUpdate(index, value);
        } else if (action === 'CANCELADD')
            handleDelete(index);
    }

    function handleRevoke(action: boolean, index: number) {
        setIsRevokeOpen(false);

        if (action) {
            props.handleRevoke(index);
        }
    }

    function handleDelete(index: number) {
        props.handleDelete(index);
    }

    return (
        <Row key={index}>
            <Cell width="30%">
                {RenderNameCell(item.name, isNewRecord)}
            </Cell>
            <Cell>
                <RenderKeyCell item={item} isAddOpen={props.isAddOpen} index={index} handleRevoke={handleRevoke} />
            </Cell>
            <Cell align="right" width="100px">
                {RenderActionCell(item, isNewRecord)}
            </Cell>
        </Row>
    );

    function RenderKeyCell(props: { item: AuthenticationKey; index: number; isAddOpen: boolean; handleRevoke: (action: boolean, index: number) => void; }) {
        if (isRevokeOpen)
            return <ApplicationKeylineRevoke disabled={props.isAddOpen} index={index} handleRevoke={handleRevoke} />;
        else if (item.revoked)
            return <span className="italic">Revoked: {item.key} </span>;
        else
            return <span>{item.key}</span>;
    }

    function validateName(name: string) {
        if (name === "")
            setIsNameValid(false);
        else {
            setIsNameValid(true);
            handleUpdate('UPDATE', name);
        }
    }

    function RenderNameCell(name: string, isNew: boolean) {
        if (isNew)
            return <Input
                defaultValue={name}
                required={true}
                placeholder="Enter name of Api Key"
                type="text"
                status={isNameValid ? '' : 'error'}
                onChange={(e) => { item.name = e.target.value; }} />;
        else
            return <span>{name}</span>;
    }

    function RenderActionCell(item: AuthenticationKey, isNewRecord: boolean) {
        if (isNewRecord) {
            return (<>
                <Button title="Save" className='iconButton' icon={<CheckCircleFilled />} onClick={() => validateName(item.name)} />
                <Button title="Cancel" className='iconButton' icon={<CloseCircleFilled />} onClick={() => handleUpdate('CANCELADD', '')} />
            </>);
        } else if (!item.revoked)
            return <Button disabled={props.isAddOpen} onClick={() => setIsRevokeOpen(true)}>Revoke</Button>;


        else
            return <Button disabled={props.isAddOpen} title="Delete" className='iconButton' icon={<DeleteFilled />} onClick={() => handleDelete(index)}>Delete</Button>;
    }
}

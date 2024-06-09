import React, { useMemo, useState } from "react";

import { WebHookInlineEdit } from "./WebHookInlineEdit";
import { WebHookInlineDelete } from "./WebHookInlineDelete";
import { Cell } from "../../DataTable/Cell";
import { Row } from "../../DataTable/Row";
import { Button } from "antd";
import {EditFilled, DeleteFilled } from '@ant-design/icons';

type Props = {
    item: string,
    index: number,
    isNewRecord: boolean,
    handleUpdate: (index: number, value: string) => void,
    handleDelete: (index: number) => void,
    isAddOpen: boolean
};

export function WebHookItem(props: Props) {
    const { item, index, isNewRecord } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const showEditDelete = useMemo(() => !isEditOpen && !isDeleteOpen && !isNewRecord, [isEditOpen, isDeleteOpen, isNewRecord]);

    function handleUpdate(action: string, value: string) {
        setIsEditOpen(false);

        if (action === 'UPDATE') {
            props.handleUpdate(index, value);
        } else if (action === 'CANCELADD')
            handleDelete(true, index);
    }

    function handleDelete(action: boolean, index: number) {
        setIsDeleteOpen(false);

        if (action) {
            props.handleDelete(index);
        }
    }

    return (
        <Row key={index}>
            <Cell>
                {RenderCell()}
            </Cell>

            <Cell width="200px" align="right">
                {showEditDelete ?
                    <>
                        <Button disabled={props.isAddOpen} title="Edit" className='iconButton' icon={<EditFilled />} onClick={() => setIsEditOpen(true)}>Edit</Button>
                        <Button disabled={props.isAddOpen} title="Delete" className='iconButton' icon={<DeleteFilled />} onClick={() => setIsDeleteOpen(true)}>Delete</Button>
                    </>
                    : <p>&nbsp;</p>}
            </Cell>
        </Row>
    );

    function RenderCell() {
        if (isEditOpen || isNewRecord)
            return <WebHookInlineEdit item={item} handleUpdate={handleUpdate} isNewRecord={isNewRecord} />;
        else if (isDeleteOpen)
            return <WebHookInlineDelete item={item} index={index} handleDelete={handleDelete} />;


        else
            return <span>{item}</span>;
    }
}

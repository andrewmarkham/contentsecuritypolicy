import React, { useMemo, useState } from "react";
import { DataTableCell, DataTableRow, DeleteIcon, EditIcon, IconButton } from "@episerver/ui-framework";
import { WebHookInlineEdit } from "./WebHookInlineEdit";
import { WebHookInlineDelete } from "./WebHookInlineDelete";

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
        <DataTableRow key={index} rowId={index.toString()}>
            <DataTableCell>
                {RenderCell()}
            </DataTableCell>

            <DataTableCell>
                {showEditDelete ?
                    <>
                        <IconButton disabled={props.isAddOpen} title="Edit" className='iconButton' icon={<EditIcon />} onClick={() => setIsEditOpen(true)} />
                        <IconButton disabled={props.isAddOpen} title="Delete" className='iconButton' icon={<DeleteIcon />} onClick={() => setIsDeleteOpen(true)} />
                    </>
                    : <p>&nbsp;</p>}
            </DataTableCell>
        </DataTableRow>
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

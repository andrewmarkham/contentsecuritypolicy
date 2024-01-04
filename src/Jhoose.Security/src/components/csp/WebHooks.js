import React, { useMemo, useState } from "react";
import {
    Typography,
    DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody, DataTableCell, DataTableRow, DeleteIcon, EditIcon, IconButton, CancelIcon, CheckIcon, TextField, TextButton
} from "@episerver/ui-framework";


export function WebHooks(props) {
    const [webhookUrls, setWebhookUrls] = useState(props.webhookUrls);
    const [isAddOpen, setIsAddOpen] = useState(false);

    function handleUpdate(index, value) {
        webhookUrls[index] = value;

        props.handleWebhookUpdate(webhookUrls);
        setWebhookUrls(webhookUrls);
        setIsAddOpen(false);
    }

    function handleDelete(index) {
        var newWebhookUrls = webhookUrls.toSpliced(index, 1);

        props.handleWebhookUpdate(newWebhookUrls);
        setWebhookUrls(newWebhookUrls);
        setIsAddOpen(false);
    }

    function handleAdd() {
        const newWebhookUrls = [...webhookUrls];
        newWebhookUrls.push("");
        setWebhookUrls(newWebhookUrls);
        setIsAddOpen(true);
    }

    return (
        <>
            <div className="tab-container">
                <Typography use="headline3">
                    <h3>Webhooks</h3>
                </Typography>
                <Typography use="body1">
                    <p>Register webhooks to recieve notification to any updates to the security headers.</p>
                </Typography>
                <DataTable>
                    <DataTableContent>
                        <DataTableHeaderRow>
                            <DataTableColumnHeaderCell>
                                Webhook Url
                            </DataTableColumnHeaderCell>
                            <DataTableColumnHeaderCell>
                                &nbsp;
                            </DataTableColumnHeaderCell>
                        </DataTableHeaderRow>

                        <DataTableBody>
                            {webhookUrls?.map((w, index) => {
                                return <WebHookItem
                                    key={index}
                                    item={w}
                                    index={index}
                                    isNewRecord={w === ""}
                                    isAddOpen={isAddOpen}
                                    handleUpdate={handleUpdate}
                                    handleDelete={handleDelete} />;
                            })}
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>
            </div>
            <WebHookAdd handleAdd={handleAdd} disabled={isAddOpen} />
        </>
    );
}

export function WebHookItem(props) {
    const { item, index, isNewRecord } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const showEditDelete = useMemo(() => !isEditOpen && !isDeleteOpen && !isNewRecord, [isEditOpen, isDeleteOpen, isNewRecord]);

    function handleUpdate(action, value) {
        setIsEditOpen(false);

        if (action === 'UPDATE') {
            props.handleUpdate(index, value);
        } else if (action === 'CANCELADD')
            handleDelete(true, index);
    }

    function handleDelete(action, index) {
        setIsDeleteOpen(false);

        if (action) {
            props.handleDelete(index);
        }
    }

    return (
        <DataTableRow key={index}>
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

export function WebHookInlineDelete(props) {
    const { item, index } = { ...props };

    function handleDelete(action) {
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

export function WebHookInlineEdit(props) {
    const { item, isNewRecord } = { ...props };
    const [hasError, setHasError] = useState(false);
    const [newValue, setNewValue] = useState(item);

    function isValidUrl(newValue) {

        var res = newValue.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        if (res == null)
            return false;

        else
            return true;
    }

    function handleUpdate(action, value) {

        if (action === 'UPDATE') {
            if (isValidUrl(value))
                props.handleUpdate(action, value);

            else
                setHasError(true);
        }

        else if (isNewRecord)
            props.handleUpdate('CANCELADD');

        else
            props.handleUpdate('CANCEL');
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
                onChange={(e) => { setNewValue(e.target.value); } } />

            <IconButton title="Update" className='iconButton' icon={<CheckIcon />} onClick={(e) => handleUpdate('UPDATE', newValue)} />
            <IconButton title="Cancel" className='iconButton' icon={<CancelIcon />} onClick={() => handleUpdate('CANCEL', '')} />
        </>
    );
}
export function WebHookAdd(props) {

    return (
        <div>
            <TextButton disabled={props.disabled} onClick={() => props.handleAdd()}>Add New Webhook</TextButton>
        </div>
    );
}


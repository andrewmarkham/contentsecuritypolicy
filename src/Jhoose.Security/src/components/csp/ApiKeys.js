import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
    Typography,
    DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody, CancelIcon, CheckIcon, DataTableCell, DataTableRow, DeleteIcon, IconButton, TextButton, TextField
} from "@episerver/ui-framework";


export function ApiKeys(props) {
    const [authenticationKeys, setAuthenticationKeys] = useState(props.authenticationKeys);
    const [isAddOpen, setIsAddOpen] = useState(false);

    function handleUpdate(index, value) {

        var newAuthenticationKeys = [...authenticationKeys];

        newAuthenticationKeys[index].name = value;

        props.handleAuthKeysUpdate(newAuthenticationKeys);
        setAuthenticationKeys(newAuthenticationKeys);
        setIsAddOpen(false);
    }

    function handleRevoke(index) {
        authenticationKeys[index].revoked = true;

        props.handleAuthKeysUpdate(authenticationKeys);
        setAuthenticationKeys(authenticationKeys);
        setIsAddOpen(false);
    }

    function handleDelete(index) {
        var newAuthenticationKeys = authenticationKeys.toSpliced(index, 1);

        //props.handleUpdate(newWebhookUrls);
        setAuthenticationKeys(newAuthenticationKeys);
        setIsAddOpen(false);
    }

    function handleAdd() {
        const newauthenticationKeys = [...authenticationKeys];
        newauthenticationKeys.push(
            {
                name: "",
                key: btoa(uuidv4()),
                revoked: false
            }
        );
        setAuthenticationKeys(newauthenticationKeys);
        setIsAddOpen(true);
    }

    return (
        <>
            <div className="tab-container">
                <Typography use="headline3">
                    <h3>Authentication Keys</h3>
                </Typography>
                <Typography use="body1">
                    <p>Create authentication keys to gain access to the API.</p>
                </Typography>
                <DataTable>
                    <DataTableContent>
                        <DataTableHeaderRow>
                            <DataTableColumnHeaderCell>
                                Name
                            </DataTableColumnHeaderCell>
                            <DataTableColumnHeaderCell>
                                Api Key
                            </DataTableColumnHeaderCell>
                            <DataTableColumnHeaderCell>
                                &nbsp;
                            </DataTableColumnHeaderCell>
                        </DataTableHeaderRow>

                        <DataTableBody>
                            {authenticationKeys?.map((w, index) => {
                                return <ApplicationKeyItem
                                    key={index}
                                    item={w}
                                    index={index}
                                    isNewRecord={w.name === ""}
                                    isAddOpen={isAddOpen}
                                    handleUpdate={handleUpdate}
                                    handleDelete={handleDelete}
                                    handleRevoke={handleRevoke} />;
                            })}
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>
            </div>

            <ApplicationKeyAdd disabled={isAddOpen} handleAdd={handleAdd} />
        </>
    );
}export function ApplicationKeyItem(props) {
    const { item, index, isNewRecord } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [isNameValid, setIsNameValid] = useState(true);

    function handleUpdate(action, value) {
        setIsEditOpen(false);

        if (action === 'UPDATE') {
            props.handleUpdate(index, value);
        } else if (action === 'CANCELADD')
            handleDelete(index);
    }

    function handleRevoke(action, index) {
        setIsRevokeOpen(false);

        if (action) {
            props.handleRevoke(index);
        }
    }

    function handleDelete(index) {
        props.handleDelete(index);
    }

    return (
        <DataTableRow key={index}>
            <DataTableCell>
                {RenderNameCell(item.name, isNewRecord)}
            </DataTableCell>
            <DataTableCell>
                {RenderKeyCell(item, index)}
            </DataTableCell>
            <DataTableCell>
                {RenderActionCell(item, isNewRecord)}
            </DataTableCell>
        </DataTableRow>
    );

    function RenderKeyCell(item, index) {
        if (isRevokeOpen)
            return <ApplicationKeylineRevoke disabled={props.isAddOpen} item={item} index={index} handleRevoke={handleRevoke} />;
        else if (item.revoked)
            return <span className="italic">Revoked: {item.key} </span>;

        else
            return <span>{item.key} </span>;
    }

    function validateName(name) {
        if (name === "")
            setIsNameValid(false);
        else {
            setIsNameValid(true);
            handleUpdate('UPDATE', name);
        }
    }

    function RenderNameCell(name, isNew) {
        if (isNew)
            return <TextField
                outlined
                defaultValue={name}
                required={true}
                placeholder="Enter name of Api Key"
                type="text"
                invalid={!isNameValid}
                onChange={(e) => { item.name = e.target.value; } } />;

        else
            return <span>{name} </span>;
    }

    function RenderActionCell(item, isNewRecord) {
        if (isNewRecord) {
            return (<>
                <IconButton title="Save" className='iconButton' icon={<CheckIcon />} onClick={() => validateName(item.name)} />
                <IconButton title="Cancel" className='iconButton' icon={<CancelIcon />} onClick={() => handleUpdate('CANCELADD')} />
            </>);
        } else if (!item.revoked)
            return <TextButton disabled={props.isAddOpen} onClick={() => setIsRevokeOpen(true)}>Revoke</TextButton>;

        else
            return <IconButton disabled={props.isAddOpen} title="Delete" className='iconButton' icon={<DeleteIcon />} onClick={() => handleDelete(index)} />;
    }
}
export function ApplicationKeylineRevoke(props) {
    const { item, index } = { ...props };

    function handleRevoke(action) {
        props.handleRevoke(action, index);
    }
    return (
        <>
            <span> - Are you sure you want to revoke this API key?</span>

            <IconButton disabled={props.disabled} title="Revoke" className='iconButton' icon={<CheckIcon />} onClick={() => handleRevoke(true)} />
            <IconButton disabled={props.disabled} title="Cancel" className='iconButton' icon={<CancelIcon />} onClick={() => handleRevoke(false)} />
        </>
    );
}
export function ApplicationKeyAdd(props) {

    return (
        <div>
            <TextButton disabled={props.disabled} onClick={() => props.handleAdd()}>Add New Api Key</TextButton>
        </div>
    );
}


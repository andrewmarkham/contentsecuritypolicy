import React, { useEffect, useState } from "react";

import { Button, Input, Select } from 'antd';
import {CloseCircleFilled, CheckCircleFilled, DeleteFilled } from '@ant-design/icons';
import { AuthenticationKey } from "../../../Csp/Types/types";
import { Cell } from "../../../../components/DataTable/Cell/Cell";
import { Row } from "../../../../components/DataTable/Row/Row";
import './ApplicationKeyItem.css';

type SiteOption = { value: string; label: string };

export function ApplicationKeyItem(props: { item: AuthenticationKey; index: number; isNewRecord: boolean; isAddOpen: boolean; siteOptions: SiteOption[]; siteName: string; handleUpdate: (index: number, value: string, siteId?: string) => void; handleSiteChange: (index: number, siteId: string) => void; handleDelete: (index: number) => void; handleRevoke: (index: number) => void; }) {
    const { item, index, isNewRecord } = { ...props };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isNameValid, setIsNameValid] = useState(true);
    const [nameValue, setNameValue] = useState(item.name);
    const [siteValue, setSiteValue] = useState(item.site);

    useEffect(() => {
        setNameValue(item.name);
    }, [item.name]);

    useEffect(() => {
        setSiteValue(item.site);
    }, [item.site]);

    function handleUpdate(action: string, value: string) {
        setIsEditOpen(false);

        if (action === 'UPDATE') {
            props.handleUpdate(index, value, siteValue);
        } else if (action === 'CANCELADD')
            handleDelete(index);
    }

    function handleRevoke(action: boolean, index: number) {
        if (action) {
            props.handleRevoke(index);
        }
    }

    function handleDelete(index: number) {
        props.handleDelete(index);
    }

    return (
        <Row key={index}>
            <Cell width="25%">
                {RenderNameCell(item.name, isNewRecord)}
            </Cell>
            <Cell width="20%">
                {RenderSiteCell(item.site)}
            </Cell>
            <Cell>
                <RenderKeyCell item={item} isAddOpen={props.isAddOpen} index={index} handleRevoke={handleRevoke} />
            </Cell>
            <Cell align="right" width="200px">
                {RenderActionCell(item, isNewRecord)}
            </Cell>
        </Row>
    );

    function RenderKeyCell(props: { item: AuthenticationKey; index: number; isAddOpen: boolean; handleRevoke: (action: boolean, index: number) => void; }) {
        if (item.revoked)
            return <span className="italic">Revoked: {item.key} </span>;
        else
            return <span>{item.key}</span>;
    }

    function RenderSiteCell(site: string) {
        if (isNewRecord) {
            return (
                <Select
                    value={siteValue}
                    options={props.siteOptions}
                    onChange={(value) => {
                        setSiteValue(value);
                        props.handleSiteChange(index, value);
                    }}
                    className="application-key-item__select"
                />
            );
        }
        return <span>{props.siteName}</span>;
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
                value={nameValue}
                required={true}
                placeholder="Enter name of Api Key"
                type="text"
                status={isNameValid ? '' : 'error'}
                onChange={(e) => { setNameValue(e.target.value); }} />;
        else
            return <span>{name}</span>;
    }

    function RenderActionCell(item: AuthenticationKey, isNewRecord: boolean) {
        if (isNewRecord) {
            return (<div>
                <Button title="Save" className='iconButton' icon={<CheckCircleFilled />} onClick={() => validateName(nameValue)}>Save</Button>
                <Button title="Cancel" className='iconButton' icon={<CloseCircleFilled />} onClick={() => handleUpdate('CANCELADD', '')}>Cancel</Button>
            </div>);
        } else if (!item.revoked)
            return <Button disabled={props.isAddOpen} onClick={() => handleRevoke(true, index)}>Revoke</Button>;


        else
            return <Button disabled={props.isAddOpen} title="Delete" className='iconButton' icon={<DeleteFilled />} onClick={() => handleDelete(index)}>Delete</Button>;
    }
}

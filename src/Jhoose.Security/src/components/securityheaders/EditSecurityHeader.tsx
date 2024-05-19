import React, { useState, useMemo, useEffect } from 'react';
import { ExposedDropdownMenu, Checkbox, TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";
import { getHeaderOptions } from './SecurityHeaderHelper';
import { SecurityHeader } from './types/securityHeader';

type Props = {
    isOpen: boolean,
    header: SecurityHeader,
    onClose: (e: any, callback: any) => void
}

export function EditSecurityHeader(props: Props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [header, setHeader] = useState(props.header);

    const title = `Edit Response Header`;

    function setHeaderValue(key: string, value: any) {
        //setIsDirty(true);

        var newHeader = { ...header };

        switch (key) {
            case "mode":
                newHeader.mode = parseInt(value);
                break;

            case "enabled":
                newHeader.enabled = value = !newHeader.enabled;
                break;

            case "includeSubDomains":
                newHeader.includeSubDomains = !newHeader.includeSubDomains;
                break;
            case "maxage":
                newHeader.maxAge = parseInt(value) ;
                break;
            case "domain":
                newHeader.domain = value ?? "";
                break;
            default:
                break;
        }

        setHeader(newHeader);
    }
    return (
        <Dialog className="editDialog" open={isOpen}
            title={title}
            dismissLabel="Cancel"
            confirmLabel="OK"
            enableConfirm={true}
            onInteraction={(e) => props.onClose(e, () => {
                return header;
            })}>
            <GridRow>
                <GridCell span={12}>
                    <h3>{header.name}</h3>
                </GridCell>
                <GridCell span={12}>
                    <Checkbox checked={header.enabled}
                        onChange={(e) => {
                            setHeaderValue("enabled", e.currentTarget.value);
                        }}>Enabled</Checkbox>
                </GridCell>

                <HeaderOptions header={header} setHeaderValue={setHeaderValue} />
                <HeaderHSTS header={header} setHeaderValue={setHeaderValue} />
                <HeaderDomain header={header} setHeaderValue={setHeaderValue} />

            </GridRow>
        </Dialog>
    )
}

const HeaderOptions = (props : {header: SecurityHeader, setHeaderValue: any}) => { 

    const { header } = { ...props };
    const { mode } = { ...header };

    if (typeof (mode) === "undefined") return null;

    return (
        <GridCell span={12}>
            <ExposedDropdownMenu
                label="Mode"
                options={getHeaderOptions(header.name)}
                value={mode.toString()}
                onValueChange={(value) => {
                    props.setHeaderValue("mode", value);
                }}
            >
            </ExposedDropdownMenu>
        </GridCell>
    )
  }

const HeaderHSTS = (props : {header: SecurityHeader, setHeaderValue: any }) => { 

    const { header } = { ...props };
    const { maxAge } = { ...header };

    if (typeof (maxAge) === "undefined") return null;

    return (
        <>
        <GridCell span={12}>
            <Checkbox
                checked={header.includeSubDomains}
                onChange={(e) => {
                    props.setHeaderValue("includeSubDomains", e.currentTarget.value);
                }}>Include SubDomains</Checkbox>
        </GridCell>

        <GridCell span={12}>
            <TextField outlined={true}
                value={maxAge.toString()}
                inputMode='numeric'
                label='Max Age'
                onChange={(e) => {
                    props.setHeaderValue("maxage", e.currentTarget.value);
                }}></TextField>
        </GridCell>
    </>
    )
  }

const HeaderDomain = (props : {header: SecurityHeader, setHeaderValue: any}) => { 

    const { header } = { ...props };
    const { mode } = { ...header };

    if (mode !== 2) return null;

    return (
        <GridCell span={12}>
        <TextField outlined={true}
            value={header.domain ?? ""}
            label='Domain'
            inputMode='url'
            onChange={(e) => {
                props.setHeaderValue("domain", e.currentTarget.value);
            }}></TextField>
    </GridCell>
    )
  }
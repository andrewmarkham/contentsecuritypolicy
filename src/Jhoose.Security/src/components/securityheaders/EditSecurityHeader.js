import React, { useState, useMemo, useEffect } from 'react';
import { ExposedDropdownMenu, Checkbox, TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";
import { getHeaderOptions } from './SecurityHeaderHelper';

export function EditSecurityHeader(props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [header, setHeader] = useState(props.header);

    //const [value, setValue] = useState(policy.value);

    const title = `Edit Response Header`;

    function showOptions(header) {
        const { mode } = { ...header };

        return typeof (mode) === "undefined" ? false : true;
    }

    function showHSTS(header) {
        const { maxAge } = { ...header };

        return typeof (maxAge) === "undefined" ? false : true;
    }

    function showDomain(header) {
        const { domain } = { ...header };

        return typeof (domain) === "undefined" ? false : true;
    }

    function setHeaderValue(key, value) {
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
                newHeader.maxAge = parseInt(value);
                break;
            case "domain":
                newHeader.domain = value;
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

                {showOptions(header) &&
                    <>
                        <GridCell span={12}>
                            <ExposedDropdownMenu
                                label="Mode"
                                options={getHeaderOptions(header.name)}
                                value={header.mode.toString()}
                                onValueChange={(value) => {
                                    setHeaderValue("mode", value);
                                }}
                            >
                            </ExposedDropdownMenu>
                        </GridCell>
                    </>
                }
                {showHSTS(header) &&
                    <>
                        <GridCell span={12}>
                            <Checkbox
                                checked={header.includeSubDomains}
                                onChange={(e) => {
                                    setHeaderValue("includeSubDomains", e.currentTarget.value);
                                }}>Include SubDomains</Checkbox>
                        </GridCell>

                        <GridCell span={12}>
                            <TextField outlined="true"
                                value={header.maxAge}
                                inputMode='numeric'
                                label='Max Age'
                                onChange={(e) => {
                                    setHeaderValue("maxage", e.currentTarget.value);
                                }}></TextField>
                        </GridCell>
                    </>
                }

                {showDomain(header) &&
                    <>
                        <GridCell span={12}>
                            <TextField outlined="true"
                                value={header.domain ?? ""}
                                label='Domain'
                                inputMode='url'
                                onChange={(e) => {
                                    setHeaderValue("domain", e.currentTarget.value);
                                }}></TextField>
                        </GridCell>
                    </>
                }
            </GridRow>
        </Dialog>
    )
}


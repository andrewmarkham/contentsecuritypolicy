import React, { useState, useMemo, useEffect } from 'react';
import { ExposedDropdownMenu,Checkbox,TextField, Dialog, GridCell, GridRow } from "@episerver/ui-framework";

export function EditSecurityHeader(props) {

    const [isOpen, setIsOpen] = useState(props.isOpen);

    const [header, setHeader] = useState(props.header);
    
    //const [value, setValue] = useState(policy.value);

    const title = `Edit Response Header`;

    function isEmpty(obj) {
        return Object.keys(obj ?? {}).length === 0;
    }

    function getOptions(header, mode) {

        var options = {
            "Cross-Origin-Embedder-Policy": [
                { label: "UnSafeNone", value: 0 },
                { label: "RequireCorp", value: 1 }
            ],

            "Cross-Origin-Opener-Policy": [
                { label: "UnSafeNone", value: 0 },
                { label: "SameOriginAllowPopups", value: 1 },
                { label: "SameOrigin", value: 2 }
            ],

            "Cross-Origin-Resource-Policy": [
                { label: "SameSite", value: 0 },
                { label: "SameOrigin", value: 1 },
                { label: "CrossOrigin", value: 2 }
            ],

            "Referrer-Policy": [
                { label: "NoReferrer", value: 0 },
                { label: "NoReferrerWhenDownGrade", value: 1 },
                { label: "Origin", value: 2 },
                { label: "OriginWhenCrossOrigin", value: 3 },
                { label: "SameOrigin", value: 4 },
                { label: "StrictOrigin", value: 5 },
                { label: "StrictOriginWhenCrossOrigin", value: 6 },
                { label: "UnsafeUrl", value: 7 }
            ],

            "X-Frame-Options": [
                { label: "Deny", value: 0 },
                { label: "SameOrigin", value: 1 },
                { label: "AllowFrom", value: 2 }
            ],

            "X-Permitted-Cross-Domain-Policies": [
                { label: "None", value: 0 },
                { label: "MasterOnly", value: 1 },
                { label: "ByContentType", value: 2 },
                { label: "All", value: 3 }
            ]
            
        }

        return options[header];
    }

    function showOptions(header) {
        const {mode} = {...header};

        return typeof(mode) === "undefined" ? false : true;
    }

    return(
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
                        <h3>{header.header}</h3>
                    </GridCell>
                    <GridCell span={12}>
                        <Checkbox checked={header.enabled}>Enabled</Checkbox>
                    </GridCell>
                   
                    { showOptions(header) &&
                    <>
                     <GridCell span={12}>
                        <ExposedDropdownMenu
                                label="Mode"
                                options={getOptions(header.header, header.mode)}
                                value={header.mode}
                               >
                        </ExposedDropdownMenu>
                        </GridCell>
                        </>
                    }
                    { !isEmpty(header) &&
                    <>

                    </>
                    }
                </GridRow>
        </Dialog>
    )
}


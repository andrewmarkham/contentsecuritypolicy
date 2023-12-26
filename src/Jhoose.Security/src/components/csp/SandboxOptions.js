import React, { useState } from 'react';
import { Checkbox, GridCell, GridRow } from "@episerver/ui-framework";

export function SandboxOptions(props) {

    var [options, setOptions] = useState(props.options);

    function setPolicyValue(key, value) {

        var newOptions = { ...options };

        newOptions[key] = !options[key];

        setOptions(newOptions);
        props.update(newOptions);
    };

    var labels = {
        "allowForms": "allow forms" ,
        "allowSameOrigin" : "allow same origin", 
        "allowScripts" : "allow scripts" ,
        "allowPopups": "allow popups"  ,
        "allowModals": "allow modals" ,
        "allowOrientationLock": "allow orientation lock",  
        "allowPointerLock": "allow pointer lock" ,
        "allowPresentation": "allow presentation" ,
        "allowPopupsToEscapeSandbox": "allow popups to escape sandbox", 
        "allowTopNavigation": "allow top navigation" ,
        "allowTopNavigationByUserActivation": "allow top navigation by user activation" 
    }

    return (
    <fieldset>
        <legend>Options</legend>
        <GridRow>
            <GridCell span={12}>
                <Checkbox checked={options.enabled} onChange={(e) => {
                    setPolicyValue("enabled", e.currentTarget.value);
                }}>Enabled</Checkbox>
            </GridCell>
            {options.enabled &&
            <>
            {Object.entries(options).map(([key, value]) => {
                if (key != "enabled") {
                return <GridCell span={3} key={key}>
                        <Checkbox checked={value} onChange={(e) => {
                            setPolicyValue(key, e.currentTarget.value);
                        }}>{labels[key]}</Checkbox>
                    </GridCell>
                }
            })}
            </>
        }
        </GridRow>
            
    </fieldset>);
}

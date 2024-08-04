import React, { useState } from 'react';
import { Col, Row,Checkbox, Flex } from 'antd';
import { SandboxOptions } from './types/types';

type SandboxSummary = {
    label: string,
    descrption: string
}
var labels: Record<string, SandboxSummary> = {
    "allowDownloads": { label: "allow downloads", descrption: "Allows downloading files through an <a> or <area> element with the download attribute, as well as through the navigation that leads to a download of a file. This works regardless of whether the user clicked on the link, or JS code initiated it without user interaction." },
    "allowForms": { label: "allow forms" , descrption :"Allows the page to submit forms. If this keyword is not used, form will be displayed as normal, but submitting it will not trigger input validation, sending data to a web server or closing a dialog."},
    "allowSameOrigin" : { label: "allow same origin" , descrption :"If this token is not used, the resource is treated as being from a special origin that always fails the same-origin policy (potentially preventing access to data storage/cookies and some JavaScript APIs)."}, 
    "allowScripts" : { label: "allow scripts" , descrption :"Allows the page to run scripts (but not create pop-up windows). If this keyword is not used, this operation is not allowed."} ,
    "allowPopups": { label: "allow popups" , descrption :"Allows popups (like from Window.open(), target=\"_blank\", Window.showModalDialog()). If this keyword is not used, that functionality will silently fail."}  ,
    "allowModals": { label: "allow modals" , descrption :"Allows the page to open modal windows by Window.alert(), Window.confirm(), Window.print() and Window.prompt(), while opening a <dialog> is allowed regardless of this keyword. It also allows the page to receive BeforeUnloadEvent event."} ,
    "allowOrientationLock": { label: "allow orientation lock" , descrption :"Lets the resource lock the screen orientation."},  
    "allowPointerLock": { label: "allow pointer lock" , descrption :"Allows the page to use the Pointer Lock API."} ,
    "allowPresentation": { label: "allow presentation" , descrption :"Allows embedders to have control over whether an iframe can start a presentation session."} ,
    "allowPopupsToEscapeSandbox": { label: "allow popups to escape sandbox" , descrption :"Allows a sandboxed document to open new windows without forcing the sandboxing flags upon them. This will allow, for example, a third-party advertisement to be safely sandboxed without forcing the same restrictions upon the page the ad links to."}, 
    "allowTopNavigation": { label: "allow top navigation" , descrption :"Lets the resource navigate the top-level browsing context (the one named _top)."} ,
    "allowTopNavigationByUserActivation": { label: "allow top navigation by user activation" , descrption :"Lets the resource navigate the top-level browsing context, but only if initiated by a user gesture"} ,
    "allowTopNavigationToCustomProtocols": { label: "allow top navigation to custom protocols" , descrption :"Allows navigations to non-http protocols built into browser or registered by a website."}
}

type Props = {
    options: SandboxOptions,
    update: any
}

export function CspSandboxOptions(props: Props) {

    var [options, setOptions] = useState(props.options);

    function setPolicyValue(key: string) {

        var newOptions: SandboxOptions = { ...options };

        var oldVal : boolean = options[key as keyof SandboxOptions];
        newOptions[key as keyof SandboxOptions] = !oldVal;

        setOptions(newOptions);
        props.update(newOptions);
    };
    
    return (
    <fieldset>
        <legend>Options</legend>
        <Flex gap="large" vertical>
            <Checkbox checked={options.enabled} onChange={(e) => {
                setPolicyValue("enabled");
            }}>Enabled</Checkbox>

            <Flex gap="large" wrap>
                <SandboxOptionsCell enabled={options.enabled} name="allowDownloads" value={options.allowDownloads} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowForms" value={options.allowForms} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowModals" value={options.allowModals} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowOrientationLock" value={options.allowOrientationLock} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowPointerLock" value={options.allowPointerLock} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowPopups" value={options.allowPopups} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowPopupsToEscapeSandbox" value={options.allowPopupsToEscapeSandbox} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowPresentation" value={options.allowPresentation} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowSameOrigin" value={options.allowSameOrigin} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowScripts" value={options.allowScripts} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowTopNavigation" value={options.allowTopNavigation} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowTopNavigationByUserActivation" value={options.allowTopNavigationByUserActivation} setPolicyValue={setPolicyValue} />
                <SandboxOptionsCell enabled={options.enabled} name="allowTopNavigationToCustomProtocols" value={options.allowTopNavigationToCustomProtocols} setPolicyValue={setPolicyValue} />         
            </Flex>
        </Flex>    
    </fieldset>);
}

type SandboxOptionsCellProps = {
    name: string,
    enabled: boolean,
    value: boolean,
    setPolicyValue: (key: string) => void
}

function SandboxOptionsCell(props: SandboxOptionsCellProps) {
    var sumary = labels[props.name];
    return (
        <Checkbox title={sumary.descrption} disabled={!props.enabled} checked={props.value} onChange={(e) => {
            props.setPolicyValue(props.name);
        }}>{sumary.label}</Checkbox>
    );
}
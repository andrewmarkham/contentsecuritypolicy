import React, { useState } from 'react';
import { Checkbox, Flex } from 'antd';
import { SchemaSource } from './types/types';

type Props = {
    disabled: boolean,
    schemaSource: SchemaSource,
    update: any

}
export function CspSchemaSources(props: Props) {

    var [schemaSource, setSchemaSource] = useState(props.schemaSource);

    function setPolicyValue(key: string) {

        var newSchemaSource: SchemaSource = { ...schemaSource };

        var oldVal : boolean = newSchemaSource[key as keyof SchemaSource] as boolean;
        newSchemaSource[key as keyof SchemaSource] = !oldVal;

        setSchemaSource(newSchemaSource);

        props.update(newSchemaSource);
    };

    return (<fieldset>
        <legend>Schema Source</legend>
        <Flex gap="large" wrap>

                <Checkbox disabled={props.disabled} checked={schemaSource.http} onChange={(e) => {
                    setPolicyValue("http");
                }}>http</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.https} onChange={(e) => {
                    setPolicyValue("https");
                }}>https</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.data} onChange={(e) => {
                    setPolicyValue("data");
                }}>data</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.mediastream} onChange={(e) => {
                    setPolicyValue("mediastream");
                }}>mediastream</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.blob} onChange={(e) => {
                    setPolicyValue("blob");
                }}>blob</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.filesystem} onChange={(e) => {
                    setPolicyValue("filesystem");
                }}>filesystem</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.ws} onChange={(e) => {
                    setPolicyValue("ws");
                }}>ws</Checkbox>

                <Checkbox disabled={props.disabled} checked={schemaSource.wss} onChange={(e) => {
                    setPolicyValue("wss");
                }}>wss</Checkbox>

        </Flex>
    </fieldset>);
}

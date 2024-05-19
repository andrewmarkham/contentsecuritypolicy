import React, { useState } from 'react';
import { Checkbox, GridCell, GridRow } from "@episerver/ui-framework";
import { SchemaSource } from './types/types';

type Props = {
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
        <GridRow>

            <GridCell span={3}>
                <Checkbox checked={schemaSource.http} onChange={(e) => {
                    setPolicyValue("http");
                }}>http</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.https} onChange={(e) => {
                    setPolicyValue("https");
                }}>https</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.data} onChange={(e) => {
                    setPolicyValue("data");
                }}>data</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.mediastream} onChange={(e) => {
                    setPolicyValue("mediastream");
                }}>mediastream</Checkbox>
            </GridCell>

            <GridCell span={3}>
                <Checkbox checked={schemaSource.blob} onChange={(e) => {
                    setPolicyValue("blob");
                }}>blob</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.filesystem} onChange={(e) => {
                    setPolicyValue("filesystem");
                }}>filesystem</Checkbox>
            </GridCell>
                        <GridCell span={3}>
                <Checkbox checked={schemaSource.ws} onChange={(e) => {
                    setPolicyValue("ws");
                }}>ws</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.wss} onChange={(e) => {
                    setPolicyValue("wss");
                }}>wss</Checkbox>
            </GridCell>
        </GridRow>
    </fieldset>);
}

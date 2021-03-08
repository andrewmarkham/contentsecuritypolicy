import React, { useState } from 'react';
import { Checkbox, GridCell, GridRow } from "@episerver/ui-framework";

export function SchemaSource(props) {

    var [schemaSource, setSchemaSource] = useState(props.schemaSource);

    function setPolicyValue(key, value) {

        var newSchemaSource = { ...schemaSource };

        newSchemaSource[key] = !schemaSource[key];

        setSchemaSource(newSchemaSource);

        props.update(newSchemaSource);
    };

    return (<fieldset>
        <legend>Schema Source</legend>
        <GridRow>

            <GridCell span={3}>
                <Checkbox checked={schemaSource.http} onChange={(e) => {
                    setPolicyValue("http", e.currentTarget.value);
                }}>http</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.https} onChange={(e) => {
                    setPolicyValue("https", e.currentTarget.value);
                }}>https</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.data} onChange={(e) => {
                    setPolicyValue("data", e.currentTarget.value);
                }}>data</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.mediastream} onChange={(e) => {
                    setPolicyValue("mediastream", e.currentTarget.value);
                }}>mediastream</Checkbox>
            </GridCell>

            <GridCell span={3}>
                <Checkbox checked={schemaSource.blob} onChange={(e) => {
                    setPolicyValue("blob", e.currentTarget.value);
                }}>blob</Checkbox>
            </GridCell>
            <GridCell span={3}>
                <Checkbox checked={schemaSource.filesystem} onChange={(e) => {
                    setPolicyValue("filesystem", e.currentTarget.value);
                }}>filesystem</Checkbox>
            </GridCell>
        </GridRow>
    </fieldset>);
}

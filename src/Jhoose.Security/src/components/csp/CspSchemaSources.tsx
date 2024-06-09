import React, { useState } from 'react';
import { Col, Row,Checkbox } from 'antd';
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
        <Row>
            <Col span={3}>
                <Checkbox checked={schemaSource.http} onChange={(e) => {
                    setPolicyValue("http");
                }}>http</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.https} onChange={(e) => {
                    setPolicyValue("https");
                }}>https</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.data} onChange={(e) => {
                    setPolicyValue("data");
                }}>data</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.mediastream} onChange={(e) => {
                    setPolicyValue("mediastream");
                }}>mediastream</Checkbox>
            </Col>

            <Col span={3}>
                <Checkbox checked={schemaSource.blob} onChange={(e) => {
                    setPolicyValue("blob");
                }}>blob</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.filesystem} onChange={(e) => {
                    setPolicyValue("filesystem");
                }}>filesystem</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.ws} onChange={(e) => {
                    setPolicyValue("ws");
                }}>ws</Checkbox>
            </Col>
            <Col span={3}>
                <Checkbox checked={schemaSource.wss} onChange={(e) => {
                    setPolicyValue("wss");
                }}>wss</Checkbox>
            </Col>
        </Row>
    </fieldset>);
}

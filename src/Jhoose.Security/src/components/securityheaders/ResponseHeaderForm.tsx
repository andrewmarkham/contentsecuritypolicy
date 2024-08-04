import React, { Ref, forwardRef, useContext, useImperativeHandle, } from 'react';
import { getHeaderOptions } from './SecurityHeaderHelper';
import { SecurityHeader } from './types/securityHeader';
import type { FormProps } from 'antd';
import { Checkbox, Form, Input, InputNumber, Select } from 'antd';
import { AppContext } from '../../context';
import { RefForm } from '../csp/types/types';

export const ResponseHeaderForm = forwardRef((props: { header: SecurityHeader; handleSaved: (success: boolean) => void; }, ref: Ref<RefForm>) => {

    const { state, dispatch } = useContext(AppContext);

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({ RequestSave }));
    function RequestSave() {
        console.log("Request Save ");
        form.submit();
    }

    const onFinish: FormProps<SecurityHeader>['onFinish'] = (values) => {

        var newHeader = { ...props.header, ...values };
        console.log('Success:', newHeader);

        dispatch({
            state: state.headers,
            securityHeader: newHeader,
            actionType: "headerSave", 
            dispatcher: dispatch })

        props.handleSaved(true);
    };

    const onFinishFailed: FormProps<SecurityHeader>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            name="basic"
            
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 800 }}
            initialValues={props.header}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            onFieldsChange={(changedFields, allFields) => { console.log(changedFields, allFields); }}
            autoComplete="off"
        >
            <Form.Item<SecurityHeader>
                label="Enabled" name="enabled"
                valuePropName="checked">
                <Checkbox />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Mode" name="mode"
                hidden={(typeof (props.header?.mode) === "undefined")}>
                <Select options={getHeaderOptions(props.header.name)} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Include SubDomains" name="includeSubDomains"
                valuePropName="checked"
                hidden={(typeof (props.header?.maxAge) === "undefined")}>
                <Checkbox />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Max Age" name="maxAge"
                hidden={(typeof (props.header?.maxAge) === "undefined")}>
                <InputNumber min={1} max={31536000} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Domain" name="domain"
                hidden={(props.header?.mode !== 2)}>
                <Input variant="outlined" />
            </Form.Item>

        </Form>
    );
});

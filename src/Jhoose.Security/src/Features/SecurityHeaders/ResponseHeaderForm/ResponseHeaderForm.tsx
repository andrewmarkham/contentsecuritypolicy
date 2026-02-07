import React, { Ref, forwardRef, useEffect, useImperativeHandle } from 'react';
import { getHeaderOptions } from '../SecurityHeaderHelper';
import { SecurityHeader } from '../Types/securityHeader';
import type { FormProps } from 'antd';
import { Checkbox, Form, Input, InputNumber, Select, message } from 'antd';
import { RefForm } from '../../Csp/Types/types';
import { getErrorMessage, useUpdateSecurityHeaderMutation } from '../securityHeaderQueries';

export const ResponseHeaderForm = forwardRef((props: { header: SecurityHeader; handleSaved: (success: boolean) => void; disabled?: boolean }, ref: Ref<RefForm>) => {

    const [messageApi, contextHolder] = message.useMessage();
    const updateHeaderMutation = useUpdateSecurityHeaderMutation();
    const [form] = Form.useForm();

    const [mode, setMode] = React.useState<number | undefined>(props.header.mode);

    useImperativeHandle(ref, () => ({ RequestSave }));

    useEffect(() => {
        if (updateHeaderMutation.error) {
            messageApi.error(getErrorMessage(updateHeaderMutation.error));
        }
    }, [messageApi, updateHeaderMutation.error]);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(props.header);
        setMode(props.header.mode);
    }, [form, props.header]);
    
    function RequestSave() {
        console.log("Request Save ");
        form.submit();
    }

    const onFinish: FormProps<SecurityHeader>['onFinish'] = (values) => {

        var newHeader = { ...props.header, ...values };
        console.log('Success:', newHeader);

        updateHeaderMutation.mutate(newHeader, {
            onSuccess: () => props.handleSaved(true),
            onError: () => props.handleSaved(false),
        });
    };

    const onFinishFailed: FormProps<SecurityHeader>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
        {contextHolder}
        <Form
            name="basic"
            
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 800 }}
            initialValues={props.header}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            onFieldsChange={(changedFields, allFields) => { setMode(changedFields.find(field => field.name[0] === "mode")?.value) }}
            autoComplete="off"
        >
            <Form.Item<SecurityHeader>
                label="Enabled" name="enabled"
                valuePropName="checked">
                <Checkbox disabled={props.disabled} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Mode" name="mode"
                hidden={(typeof (props.header?.mode) === "undefined")}>
                <Select disabled={props.disabled} options={getHeaderOptions(props.header.name)} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Include SubDomains" name="includeSubDomains"
                valuePropName="checked"
                hidden={(typeof (props.header?.maxAge) === "undefined")}>
                <Checkbox disabled={props.disabled} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Max Age" name="maxAge"
                hidden={(typeof (props.header?.maxAge) === "undefined")}>
                <InputNumber disabled={props.disabled} min={1} max={31536000} />
            </Form.Item>

            <Form.Item<SecurityHeader>
                label="Domain" name="domain"
                hidden={!(props.header.name === "X-Frame-Options" && mode === 2)}>
                <Input disabled={props.disabled} variant="outlined" />
            </Form.Item>

        </Form>
        </>
    );
});

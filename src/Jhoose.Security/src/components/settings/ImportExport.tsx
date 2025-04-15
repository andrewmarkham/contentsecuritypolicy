import { Button, Checkbox, Divider, Form, FormProps, Space } from "antd";
import React, { useEffect, useState } from "react";


export type ExportOptions = {
    csp: boolean,
    responseHeaders: boolean
  }

export default function ImportExport() {
    
    const [form] = Form.useForm();
    const [exportOptions, setExportOptions] = useState<ExportOptions>({ csp: true, responseHeaders: true });
    
    useEffect(() => {
          form.setFieldsValue(exportOptions);
      });

      const onFinish: FormProps<ExportOptions>['onFinish'] = (values) => {

        var newSettings = { ...exportOptions, ...values };
    
        console.log(newSettings);
      };
    return <div className="tab-container">

        <Divider orientation="left">Export Settings</Divider>

        <div className="form-container">
        <Form
            name="basic"
            form={form}
            onFinish={onFinish}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 800 }}
            autoComplete="off">
        
            <Form.Item<ExportOptions>
                name="csp" valuePropName="checked">
                <Checkbox>Export Content Security Policy</Checkbox>
            </Form.Item>

            <Form.Item<ExportOptions>
                name="responseHeaders" valuePropName="checked">
                <Checkbox>Export Response Headers</Checkbox>
            </Form.Item>

            <Space className="toolBar">
                <Button type="primary" htmlType="submit">
                Export
                </Button>
            </Space>

        </Form>
        </div>
        <Divider orientation="left">Import Settings</Divider>

    </div>
}
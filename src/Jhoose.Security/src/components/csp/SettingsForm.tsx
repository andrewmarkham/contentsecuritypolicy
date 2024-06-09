import React, { useContext, useEffect, useState } from "react";
import { SecuritySettings } from "./types/types";
import { AppContext } from "../../context";
import { Button, Form, FormProps, Input, Select, Space } from "antd";


export const SettingsForm = () => {

  const { state, dispatch } = useContext(AppContext);

  const [isDirty, setIsDirty] = useState(false);

  const [form] = Form.useForm();

  const options = [
    { label: "On", value: "on" },
    { label: "Off", value: "off" },
    { label: "Report Only", value: "report" },
  ];

  useEffect(() => {
    dispatch({ state: state.settings, actionType: "settingsLoad", dispatcher: dispatch });
  }, []);

  useEffect(() => {

    if (!state.settings.loading) {
      form.setFieldsValue(state.settings.settings);
    }
  }, [state.settings.loading]);

  const onFinish: FormProps<SecuritySettings>['onFinish'] = (values) => {

    var newSettings = { ...state.settings.settings, ...values };
    console.log('Success:', newSettings);

    dispatch({ state: state.settings, actionType: "settingsSave", dispatcher: dispatch });
  };

  const onFinishFailed: FormProps<SecuritySettings>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      name="basic"
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 800 }}
      disabled={state.settings.loading || state.settings.saving}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onFieldsChange={(changedFields, allFields) => { setIsDirty(true); }}
      autoComplete="off"
    >
      <Form.Item<SecuritySettings>
        label="Mode" name="mode">
        <Select
          placeholder="Control the mode of the module"
          options={options} />
      </Form.Item>

      <Form.Item<SecuritySettings>
        label="Endpoint Url (report-uri)"
        name="reportingUrl"
        help="The endpoint for the service that receives CSP errors; is used by the report-uri directive"
        rules={[{ type: 'url' }]}>
        <Input />
      </Form.Item>

      <Form.Item<SecuritySettings>
        label="Endpoint Url (report-to)"
        name="reportToUrl"
        help="The endpoint for the service that receives CSP errors; is used by the report-to directive">
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" disabled={!isDirty}>
            Update
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

import React, { useContext, useEffect, useState } from "react";
import { SecuritySettings } from "../csp/types/types";
import { AppContext } from "../../context";
import { Button, Divider, Form, FormProps, Input, Select, Skeleton, Space } from "antd";
import { Toaster } from "../toaster";


export const SettingsForm = () => {

  const { state, dispatch } = useContext(AppContext);

  const [isDirty, setIsDirty] = useState(false);
  const [isCSPDisabled, setIsCSPDisabled] = useState(false);
  const [reportingMode, setReportingMode] = useState(0);
  const [form] = Form.useForm();

  const options = [
    { label: "On", value: "on" },
    { label: "Off - Module is disabled", value: "off" },
    { label: "Report Only - Violations will only be reported", value: "report" },
  ];

  const reportingOptions = [
    { label: "None", value: 0 },
    { label: "Local Dashboard", value: 1 },
    { label: "External Reporting Tool", value: 2 },
  ];

  useEffect(() => {
    dispatch({ state: state.settings, actionType: "settingsLoad", dispatcher: dispatch });
  }, []);

  useEffect(() => {

    if (!state.settings.loading) {
      form.setFieldsValue(state.settings.settings);
      setIsCSPDisabled(state.settings.settings.mode === "off");
      setReportingMode(state.settings.settings.reportingMode);
    }
  }, [state.settings.loading]);

  const onFinish: FormProps<SecuritySettings>['onFinish'] = (values) => {

    var newSettings = { ...state.settings.settings, ...values };

    dispatch({ state: {
      ...state.settings,
      settings: newSettings
      }, 
      actionType: "settingsSave", 
      dispatcher: dispatch });
    setIsDirty(false);
  };

  const onFinishFailed: FormProps<SecuritySettings>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  function getReportingComponent(reportingMode: number, isCSPDisabled: boolean): React.ReactNode {
    if (isCSPDisabled) {
      return <></>
    }
    switch (reportingMode) {
      case 0:
        return <ReportingDisabled />
      case 1:
        return <ReportingLocal />
      case 2:
        return <ReportingExteranl />
    }
  }

  return (
    <>
      <Toaster show={state.settings.loading || state.settings.saving} message={state.settings.loading ? "Loading..." : "Saving..."} />
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 800 }}
        disabled={state.settings.loading || state.settings.saving}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onFieldsChange={(changedFields, allFields) => { 
          setIsDirty(true); 
          setIsCSPDisabled(allFields.find(f => f.name[0] === "mode")?.value === "off");
          setReportingMode(allFields.find(f => f.name[0] === "reportingMode")?.value);
        } }
        autoComplete="off">
      
      <Divider orientation="left">Content Security Mode</Divider>

      <Form.Item<SecuritySettings>
        label="Mode" name="mode">
        <Select
          placeholder="Control the mode of the module"
          options={options} />
      </Form.Item>

      <Divider orientation="left">Issue Reporting Mode</Divider>

      <Form.Item<SecuritySettings>
        label="Reporting Mode" name="reportingMode">
        <Select
          placeholder="Control of issues are reported"
          options={reportingOptions}
          disabled={isCSPDisabled} />
      </Form.Item>

      <Skeleton loading={state.settings.loading} active >
          {
            getReportingComponent(reportingMode, isCSPDisabled)
          }
        </Skeleton> 

        <Space className="toolBar">
          <Button type="primary" htmlType="submit" disabled={!isDirty}>
            Update
          </Button>
        </Space>

    </Form>
    </>
  );
};

export const ReportingDisabled = () => {
  return (
    <>
      <Divider orientation="left">Browser console reporting</Divider>
      <p className="formCopy">Any violations will be displayed in the browser console only.</p>
    </>)
}

export const ReportingLocal = () => {
  return (
    <>
      <Divider orientation="left">Local Reporting Dashboard</Divider>
      <p className="formCopy">Any violations will be displayed in the browser console and also visable in the local dashboard.</p>
    </>)
}
export const ReportingExteranl = () => {
  return (
    <>
        <Divider orientation="left">External Reporting Tool</Divider>
      
        <p className="formCopy">Any violations will be displayed in the browser console, and when configured, will be forwarded onto the external reporting dashboard.</p>
        <Form.Item<SecuritySettings>
          label="Endpoint Url (report-uri)"
          name="reportingUrl"
          help="The endpoint for the service that receives CSP errors; is used by the report-uri directive"
          rules={[{ type: 'url', message: 'Please enter a valid url' }]}>
          <Input />
        </Form.Item>

        <Form.Item<SecuritySettings>
          label="Endpoint Url (report-to)"
          name="reportToUrl"
          help="The endpoint for the service that receives CSP errors; is used by the report-to directive"
          rules={[{ type: 'url', message: 'Please enter a valid url'}]}>
          <Input />
        </Form.Item>
    </>
  );
}


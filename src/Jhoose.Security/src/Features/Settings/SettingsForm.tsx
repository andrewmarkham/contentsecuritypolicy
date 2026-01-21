import React, { useEffect, useState } from "react";
import { SecuritySettings } from "../Csp/Types/types";
import { Button, Divider, Form, FormProps, Input, Select, Skeleton, Space, message } from "antd";
import { Toaster } from "../../components/Toaster";
import { getErrorMessage, useSettingsQuery, useUpdateSettingsMutation } from "./settingsQueries";


export const SettingsForm = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

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
    if (settingsQuery.error) {
      messageApi.error(getErrorMessage(settingsQuery.error));
    }
  }, [messageApi, settingsQuery.error]);

  useEffect(() => {
    if (updateSettingsMutation.error) {
      messageApi.error(getErrorMessage(updateSettingsMutation.error));
    }
  }, [messageApi, updateSettingsMutation.error]);

  useEffect(() => {
    if (settingsQuery.data) {
      form.setFieldsValue(settingsQuery.data);
      setIsCSPDisabled(settingsQuery.data.mode === "off");
      setReportingMode(settingsQuery.data.reportingMode);
      setIsDirty(false);
    }
  }, [form, settingsQuery.data]);

  const onFinish: FormProps<SecuritySettings>['onFinish'] = (values) => {

    const baseSettings: SecuritySettings = settingsQuery.data ?? {
      mode: "on",
      permissionMode: "on",
      reportingMode: 0,
      reportingUrl: "",
      reportToUrl: "",
      webhookUrls: [],
      authenticationKeys: []
    };

    const newSettings = { ...baseSettings, ...values };

    updateSettingsMutation.mutate(newSettings, {
      onSuccess: () => {
        setIsDirty(false);
      },
    });
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
      {contextHolder}
      <Toaster
        show={settingsQuery.isLoading || settingsQuery.isFetching || updateSettingsMutation.isPending}
        message={settingsQuery.isLoading || settingsQuery.isFetching ? "Loading..." : "Saving..."}
      />
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 800 }}
        disabled={settingsQuery.isLoading || settingsQuery.isFetching || updateSettingsMutation.isPending}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onFieldsChange={(changedFields, allFields) => { 
          setIsDirty(true); 
          setIsCSPDisabled(allFields.find(f => f.name[0] === "mode")?.value === "off" && allFields.find(f => f.name[0] === "permissionMode")?.value === "off");
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

      <Divider orientation="left">Permission Policy Mode</Divider>

      <Form.Item<SecuritySettings>
        label="Mode" name="permissionMode">
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

      <Skeleton loading={settingsQuery.isLoading || settingsQuery.isFetching} active >
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

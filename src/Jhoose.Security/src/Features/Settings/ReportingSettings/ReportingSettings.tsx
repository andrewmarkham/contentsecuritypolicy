import React, { useEffect, useRef, useState } from "react";
import { SecuritySettings } from "../../Csp/Types/types";
import { Button, Divider, Form, FormProps, Input, Select, Skeleton, Space, message } from "antd";
import { Toaster } from "../../../components/Toaster/Toaster";
import { getErrorMessage, useSettingsQuery, useUpdateSettingsMutation } from "../settingsQueries";

type ReportingFormValues = Pick<SecuritySettings, "reportingMode" | "reportingUrl" | "reportToUrl">;

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  refreshToken?: number;
  resetDirtyToken?: number;
};

export const ReportingSettings = ({ onDirtyChange, refreshToken, resetDirtyToken }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();

  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  const [isDirty, setIsDirty] = useState(false);
  const [isReportingDisabled, setIsReportingDisabled] = useState(false);
  const [reportingMode, setReportingMode] = useState(0);
  const [form] = Form.useForm();
  const isProgrammaticUpdate = useRef(false);

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
      isProgrammaticUpdate.current = true;
      form.setFieldsValue({
        reportingMode: settingsQuery.data.reportingMode,
        reportingUrl: settingsQuery.data.reportingUrl,
        reportToUrl: settingsQuery.data.reportToUrl,
      });
      setIsReportingDisabled(!isReportingEnabled(settingsQuery.data));
      setReportingMode(settingsQuery.data.reportingMode);
      setIsDirty(false);
      onDirtyChange?.(false);
      isProgrammaticUpdate.current = false;
    }
  }, [form, settingsQuery.data]);

  useEffect(() => {
    if (refreshToken !== undefined) {
      settingsQuery.refetch();
    }
  }, [refreshToken]);

  useEffect(() => {
    if (resetDirtyToken !== undefined) {
      setIsDirty(false);
      onDirtyChange?.(false);
      if (settingsQuery.data) {
        isProgrammaticUpdate.current = true;
        form.setFieldsValue({
          reportingMode: settingsQuery.data.reportingMode,
          reportingUrl: settingsQuery.data.reportingUrl,
          reportToUrl: settingsQuery.data.reportToUrl,
        });
        setIsReportingDisabled(!isReportingEnabled(settingsQuery.data));
        setReportingMode(settingsQuery.data.reportingMode);
        isProgrammaticUpdate.current = false;
      }
    }
  }, [form, resetDirtyToken, settingsQuery.data]);

  const onFinish: FormProps<ReportingFormValues>["onFinish"] = (values) => {
    if (!settingsQuery.data) {
      return;
    }

    const newSettings: SecuritySettings = {
      ...settingsQuery.data,
      reportingMode: values.reportingMode ?? settingsQuery.data.reportingMode,
      reportingUrl: values.reportingUrl ?? settingsQuery.data.reportingUrl,
      reportToUrl: values.reportToUrl ?? settingsQuery.data.reportToUrl,
    };

    updateSettingsMutation.mutate(newSettings, {
      onSuccess: () => {
        setIsDirty(false);
        onDirtyChange?.(false);
      },
    });
  };

  const onFinishFailed: FormProps<ReportingFormValues>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  function getReportingComponent(mode: number, disabled: boolean): React.ReactNode {
    if (disabled) {
      return <></>;
    }
    switch (mode) {
      case 0:
        return <ReportingDisabled />;
      case 1:
        return <ReportingLocal />;
      case 2:
        return <ReportingExternal />;
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
        name="reportingSettings"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 800 }}
        disabled={settingsQuery.isLoading || settingsQuery.isFetching || updateSettingsMutation.isPending}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onFieldsChange={(changedFields, allFields) => {
          if (isProgrammaticUpdate.current) {
            return;
          }
          setIsDirty(true);
          onDirtyChange?.(true);
          setReportingMode(allFields.find((f) => f.name[0] === "reportingMode")?.value);
        }}
        autoComplete="off"
      >
        <Divider orientation="left">Issue Reporting Mode</Divider>

        <Form.Item<ReportingFormValues> label="Reporting Mode" name="reportingMode">
          <Select
            placeholder="Control of issues are reported"
            options={reportingOptions}
            disabled={isReportingDisabled}
          />
        </Form.Item>

        <Skeleton loading={settingsQuery.isLoading || settingsQuery.isFetching} active>
          {getReportingComponent(reportingMode, isReportingDisabled)}
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

const ReportingDisabled = () => {
  return (
    <>
      <Divider orientation="left">Browser console reporting</Divider>
      <p className="formCopy">Any violations will be displayed in the browser console only.</p>
    </>
  );
};

const ReportingLocal = () => {
  return (
    <>
      <Divider orientation="left">Local Reporting Dashboard</Divider>
      <p className="formCopy">Any violations will be displayed in the browser console and also visable in the local dashboard.</p>
    </>
  );
};

const ReportingExternal = () => {
  return (
    <>
      <Divider orientation="left">External Reporting Tool</Divider>

      <p className="formCopy">Any violations will be displayed in the browser console, and when configured, will be forwarded onto the external reporting dashboard.</p>
      <Form.Item<ReportingFormValues>
        label="Endpoint Url (report-uri)"
        name="reportingUrl"
        help="The endpoint for the service that receives CSP errors; is used by the report-uri directive"
        rules={[{ type: "url", message: "Please enter a valid url" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<ReportingFormValues>
        label="Endpoint Url (report-to)"
        name="reportToUrl"
        help="The endpoint for the service that receives CSP errors; is used by the report-to directive"
        rules={[{ type: "url", message: "Please enter a valid url" }]}
      >
        <Input />
      </Form.Item>
    </>
  );
};

function isReportingEnabled(settings: SecuritySettings): boolean {
  const hasEnabledMode = (mode?: string) => mode && mode !== "off";
  if (hasEnabledMode(settings.mode) || hasEnabledMode(settings.permissionMode)) {
    return true;
  }
  if (settings.siteModes && Object.values(settings.siteModes).some(hasEnabledMode)) {
    return true;
  }
  if (settings.permissionModesBySite && Object.values(settings.permissionModesBySite).some(hasEnabledMode)) {
    return true;
  }
  return false;
}

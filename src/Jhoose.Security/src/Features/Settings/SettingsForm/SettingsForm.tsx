import React, { useEffect, useRef, useState } from "react";
import { Mode, SecuritySettings } from "../../Csp/Types/types";
import { Button, Divider, Form, FormProps, Select, Space, message } from "antd";
import { Toaster } from "../../../components/Toaster/Toaster";
import { GLOBAL_DEFAULT_SITE_ID, WebsiteSelector } from "../../../components/WebsiteSelector/WebsiteSelector";
import { getErrorMessage, useSettingsQuery, useUpdateSettingsMutation } from "../settingsQueries";
import './SettingsForm.css';


type SettingsFormValues = SecuritySettings & {
  siteMode?: Mode;
  sitePermissionMode?: Mode;
};

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  refreshToken?: number;
  resetDirtyToken?: number;
};

export const SettingsForm = ({ onDirtyChange, refreshToken, resetDirtyToken }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();

  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  const [isDirty, setIsDirty] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(GLOBAL_DEFAULT_SITE_ID);
  const [form] = Form.useForm();
  const isProgrammaticUpdate = useRef(false);

  const options = [
    { label: "On", value: "on" },
    { label: "Off - Module is disabled", value: "off" },
    { label: "Report Only - Violations will only be reported", value: "report" },
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
      const siteMode = getModeForSite(settingsQuery.data, selectedSiteId);
      const sitePermissionMode = getPermissionModeForSite(settingsQuery.data, selectedSiteId);
      isProgrammaticUpdate.current = true;
      form.setFieldsValue({
        siteMode,
        sitePermissionMode,
      });
      setIsDirty(false);
      onDirtyChange?.(false);
      isProgrammaticUpdate.current = false;
    }
  }, [form, selectedSiteId, settingsQuery.data]);

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
        const siteMode = getModeForSite(settingsQuery.data, selectedSiteId);
        const sitePermissionMode = getPermissionModeForSite(settingsQuery.data, selectedSiteId);
        isProgrammaticUpdate.current = true;
        form.setFieldsValue({
          siteMode,
          sitePermissionMode,
        });
        isProgrammaticUpdate.current = false;
      }
    }
  }, [form, resetDirtyToken, selectedSiteId, settingsQuery.data]);

  const onFinish: FormProps<SettingsFormValues>['onFinish'] = (values) => {

    const baseSettings: SecuritySettings = settingsQuery.data ?? {
      mode: "on",
      permissionMode: "on",
      reportingMode: 0,
      reportingUrl: "",
      reportToUrl: "",
      webhookUrls: [],
      authenticationKeys: [],
      siteModes: {},
      permissionModesBySite: {}
    };

    const { siteMode, sitePermissionMode, ...restValues } = values;
    const siteModes = { ...(baseSettings.siteModes ?? {}) };
    const permissionModesBySite = { ...(baseSettings.permissionModesBySite ?? {}) };

    if (siteMode) {
      siteModes[selectedSiteId] = siteMode;
    }

    if (sitePermissionMode) {
      permissionModesBySite[selectedSiteId] = sitePermissionMode;
    }

    if (selectedSiteId === GLOBAL_DEFAULT_SITE_ID) {
      baseSettings.mode = siteMode ?? baseSettings.mode;
      baseSettings.permissionMode = sitePermissionMode ?? baseSettings.permissionMode;
    }

    const newSettings: SecuritySettings = { 
      ...baseSettings, 
      ...restValues, 
      siteModes, 
      permissionModesBySite 
    };

    updateSettingsMutation.mutate(newSettings, {
      onSuccess: () => {
        setIsDirty(false);
        onDirtyChange?.(false);
      },
    });
  };

  const onFinishFailed: FormProps<SettingsFormValues>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

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
        className="settings-form"
        disabled={settingsQuery.isLoading || settingsQuery.isFetching || updateSettingsMutation.isPending}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onFieldsChange={(changedFields, allFields) => { 
          if (isProgrammaticUpdate.current) {
            return;
          }
          setIsDirty(true);
          onDirtyChange?.(true);
        } }
        autoComplete="off">
      
      <Divider orientation="left">Website</Divider>
      <WebsiteSelector
        value={selectedSiteId}
        onChange={(siteId) => {
          setSelectedSiteId(siteId);
          setIsDirty(false);
          onDirtyChange?.(false);
        }}
        width="320px"
      />

      <Divider orientation="left">Content Security Mode</Divider>

      <Form.Item<SettingsFormValues>
        label="Mode" name="siteMode">
        <Select
          placeholder="Control the mode of the module"
          options={options} />
      </Form.Item>

      <Divider orientation="left">Permission Policy Mode</Divider>

      <Form.Item<SettingsFormValues>
        label="Mode" name="sitePermissionMode">
        <Select
          placeholder="Control the mode of the module"
          options={options} />
      </Form.Item>

        <Space className="toolBar">
          <Button type="primary" htmlType="submit" disabled={!isDirty}>
            Update
          </Button>
        </Space>

    </Form>
    </>
  );
};

function getModeForSite(settings: SecuritySettings, siteId: string): Mode {
  if (settings.siteModes && settings.siteModes[siteId]) {
    return settings.siteModes[siteId];
  }
  return settings.mode ?? "on";
}

function getPermissionModeForSite(settings: SecuritySettings, siteId: string): Mode {
  if (settings.permissionModesBySite && settings.permissionModesBySite[siteId]) {
    return settings.permissionModesBySite[siteId];
  }
  return settings.permissionMode ?? "on";
}

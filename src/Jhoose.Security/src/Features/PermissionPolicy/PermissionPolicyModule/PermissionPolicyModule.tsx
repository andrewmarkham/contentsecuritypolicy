import React, { useEffect, useMemo, useState } from "react";

import { Alert, Flex, Tag, Tooltip, Typography, message } from "antd";
import { Table } from "../../../components/DataTable/Table/Table";
import { Cell } from "../../../components/DataTable/Cell/Cell";
import { Header } from "../../../components/DataTable/Header/Header";
import { Permission, PermissionPolicy, PermissionSource } from "../Types/types";
import {
  WebsiteSelector,
  GLOBAL_DEFAULT_SITE_ID,
} from "../../../components/WebsiteSelector/WebsiteSelector";

import {
  PermissionPolicyData,
  browserDetails,
} from "../data/PermissionPolicyData";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

import type { Identifier } from "@mdn/browser-compat-data";
import permissionPolicyCompat from "../data/permissions-policy-compat.json";
import { Toaster } from "../../../components/Toaster/Toaster";
import { PermissionDataRow } from "../components/PermissionDataRow/PermissionDataRow";
import { getErrorMessage, usePermissionsQuery } from "../lib/permissionQueries";
import { v4 as uuidv4 } from "uuid";
import "./PermissionPolicyModule.css";

function createDefaultPermission(name: string): Permission {
  return {
    id: uuidv4(),
    key: name,
    scope: "self",
    mode: "default",
    allowlist: [],
  };
}

function SourceTag(props: { source: PermissionSource }) {
  switch (props.source) {
    case "default":
      return <Tag color="blue">Global default</Tag>;
    case "overridden":
      return <Tag color="gold">Overridden</Tag>;
    default:
      return <Tag>Inherited</Tag>;
  }
}

export function PermissionPolicyModule() {
  const { Title, Text } = Typography;

  const [messageApi, contextHolder] = message.useMessage();
  const permissionsQuery = usePermissionsQuery();
  const [activeWebsiteId, setActiveWebsiteId] = useState<string>(
    GLOBAL_DEFAULT_SITE_ID,
  );
  const [selectedWebsiteLabel, setSelectedWebsiteLabel] =
    useState<string>("Global Default");

  const permissionPolicy = permissionPolicyCompat as unknown as Identifier;
  const permissionPolicyRecords = permissionPolicy as unknown as Record<
    string,
    Identifier | undefined
  >;

  useEffect(() => {
    if (permissionsQuery.error) {
      messageApi.error(getErrorMessage(permissionsQuery.error));
    }
  }, [messageApi, permissionsQuery.error]);

  const permissions = permissionsQuery.data ?? [];
  const isLoading = permissionsQuery.isLoading || permissionsQuery.isFetching;
  const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;
  const overrideCount = useMemo(() => {
    const sitePermissions = permissions.filter((permission) => {
      const normalizedSite =
        (permission.site ?? "").trim() || GLOBAL_DEFAULT_SITE_ID;
      return normalizedSite === activeWebsiteId;
    });
    return sitePermissions.length;
  }, [permissions, activeWebsiteId]);

  const permissionsBySite = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        const normalizedSite =
          (permission.site ?? "").trim() || GLOBAL_DEFAULT_SITE_ID;
        if (!acc[normalizedSite]) {
          acc[normalizedSite] = {};
        }
        acc[normalizedSite][permission.key] = permission;
        return acc;
      },
      {} as Record<string, Record<string, Permission>>,
    );
  }, [permissions]);

  const defaultPermissionsByKey =
    permissionsBySite[GLOBAL_DEFAULT_SITE_ID] ?? {};
  const sitePermissionsByKey = permissionsBySite[activeWebsiteId] ?? {};

  return (
    <>
      {contextHolder}
      <Toaster show={isLoading} message={"Loading..."} />
      <div className="title">
        <div className="permission-policy__header">
          <div className="permission-policy__header-body">
            <Title level={1}>Permissions Policy</Title>
            <p>
              The{" "}
              <span className="permission-policy__code-tag">
                Permission-Policy
              </span>{" "}
              is not supported by all browsers
            </p>
            <p>
              Read this{" "}
              <a
                href="https://developer.chrome.com/docs/privacy-security/permissions-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                guide
              </a>{" "}
              from Google for more information about how to implement the
              Permissions Policy.
            </p>
          </div>
          <PermissionCompatibilityHeaderMatrix data={permissionPolicy} />
        </div>

        <Flex
          gap={12}
          align="flex-end"
          className="permission-policy__toolbar"
          wrap
        >
          <WebsiteSelector
            value={activeWebsiteId}
            onChange={setActiveWebsiteId}
            onSiteChange={(site) => setSelectedWebsiteLabel(site.name)}
          />
        </Flex>

        {!isDefaultWebsite && (
          <Alert
            className="permission-policy__alert"
            type="info"
            showIcon
            message={`${selectedWebsiteLabel} inherits from Global Default by default`}
            description={`${overrideCount} permission override${overrideCount === 1 ? "" : "s"} configured for this website.`}
          />
        )}

        <Table>
          <Header>
            <Cell width="250px">Permission</Cell>
            <Cell width="300px">Description</Cell>
            <Cell>Configuration</Cell>
            <Cell width="70px">Source</Cell>
            <Cell width="50px">&nbsp;</Cell>
          </Header>

          {PermissionPolicyData.map((permission: PermissionPolicy) => {
            const compatibilityData = permissionPolicyRecords[permission.name];
            const defaultPermission = defaultPermissionsByKey[permission.name];
            const overridePermission = !isDefaultWebsite
              ? sitePermissionsByKey[permission.name]
              : undefined;
            const permissionRecord =
              overridePermission ??
              defaultPermission ??
              createDefaultPermission(permission.name);
            const source: PermissionSource = isDefaultWebsite
              ? "default"
              : overridePermission
                ? "overridden"
                : "inherited";
            return (
              <React.Fragment key={permission.name}>
                <PermissionDataRow
                  policy={permission}
                  permissionRecord={permissionRecord}
                  source={source}
                  siteId={activeWebsiteId}
                  siteName={selectedWebsiteLabel}
                  inheritedPermission={
                    defaultPermission ??
                    createDefaultPermission(permission.name)
                  }
                  defaultAllowlist={permission.defaultAllowlist}
                  description={permission.description}
                  compatibility={
                    <PermissionCompatibilityMatrix data={compatibilityData} />
                  }
                  sourceTag={<SourceTag source={source} />}
                />
              </React.Fragment>
            );
          })}
        </Table>
      </div>
    </>
  );
}

const PermissionCompatibilityMatrix: React.FC<{ data?: Identifier }> = ({
  data,
}) => {
  const supportData = data?.__compat?.support;
  if (!supportData) {
    return <div>No compatibility data available.</div>;
  }

  return (
    <div className="permission-policy__compatibility">
      <p className="permission-policy__compatibility-title">
        Browser Compatibility
      </p>
      {Object.entries(supportData).map(([browser, support]) => {
        const versionAdded: number | boolean = (support as any).version_added;
        if (versionAdded === false) return null;

        return (
          <div className="permission-policy__compatibility-item" key={browser}>
            <Tooltip
              key={browser}
              placement="topLeft"
              title={`Avaliable since version ${versionAdded}`}
            >
              <p className="permission-policy__compatibility-text">
                <img
                  src={browserDetails[browser].logoUrl}
                  alt={browserDetails[browser].name}
                  className="permission-policy__compatibility-logo"
                />
                {browserDetails[browser].name}
              </p>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

const PermissionCompatibilityHeaderMatrix: React.FC<{ data?: Identifier }> = ({
  data,
}) => {
  const supportData = data?.__compat?.support;
  if (!supportData) {
    return <div>No compatibility data available.</div>;
  }

  return (
    <div className="permission-policy__matrix">
      <div className="permission-policy__matrix-grid">
        {Object.entries(supportData).map(([browser, support]) => {
          const browserInfo = browserDetails[browser];
          if (!browserInfo) {
            return null;
          }

          const versionAdded: number | boolean = (support as any).version_added;

          return (
            <div key={browser} className="permission-policy__matrix-item">
              <p className="permission-policy__matrix-label">
                {browserInfo.name}
              </p>
              <img
                src={browserInfo.logoUrl}
                alt={browserInfo.name}
                className="permission-policy__matrix-logo"
              />
              <span className="permission-policy__matrix-status">
                {versionAdded === false ? (
                  <CloseCircleTwoTone twoToneColor="red" />
                ) : (
                  <CheckCircleTwoTone twoToneColor="green" />
                )}
              </span>
            </div>
          );
        })}
      </div>
      <p>Supported browser matix</p>
    </div>
  );
};

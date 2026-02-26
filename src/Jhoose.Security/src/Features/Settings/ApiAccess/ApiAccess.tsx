import React, { useEffect } from "react";

import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import { WebHooksUi } from "../Webhooks/WebHooksUi/WebHooksUi";
import { ApiKeys } from "../ApiKeys/ApiKeys";
import { AuthenticationKey } from "../../Csp/Types/types";
import { Toaster } from "../../../components/Toaster/Toaster";
import { getErrorMessage, useSettingsQuery, useUpdateSettingsMutation } from "../settingsQueries";
import { message } from "antd";

type Props = {
    refreshToken?: number;
};

export function ApiAccess({ refreshToken }: Props) {

    const [messageApi, contextHolder] = message.useMessage();
    const settingsQuery = useSettingsQuery();
    const updateSettingsMutation = useUpdateSettingsMutation();

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
        if (refreshToken !== undefined) {
            settingsQuery.refetch();
        }
    }, [refreshToken]);
    
    function handleWebhookUpdate(webhookUrls: string[]) {
        if (!settingsQuery.data) return;
        updateSettingsMutation.mutate({
            ...settingsQuery.data,
            webhookUrls,
        });
    }

    function handleAuthKeysUpdate(authenticationKeys: AuthenticationKey[]) {
        if (!settingsQuery.data) return;
        const normalizedKeys = authenticationKeys.map((key) => ({
            ...key,
            site: key.site ?? "*",
        }));
        updateSettingsMutation.mutate({
            ...settingsQuery.data,
            authenticationKeys: normalizedKeys,
        });
    }

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'API Keys',
          children: <ApiKeys authenticationKeys={settingsQuery.data?.authenticationKeys ?? []} handleAuthKeysUpdate={handleAuthKeysUpdate} ></ApiKeys>,
        },
        {
          key: '2',
          label: 'Webhooks',
          children: <WebHooksUi webhookUrls={settingsQuery.data?.webhookUrls ?? []} handleWebhookUpdate={handleWebhookUpdate}></WebHooksUi>,
        }
      ];

    return(
        
        <>
            {contextHolder}
            <Toaster
                show={settingsQuery.isLoading || settingsQuery.isFetching || updateSettingsMutation.isPending}
                message={settingsQuery.isLoading || settingsQuery.isFetching ? "Loading..." : "Saving..."}
            />
            <div className="tab-container">
                <p>The following API gives access to the security headers, these can then be used by external sites.  Access is controlled via the <span className="italic bold">'X-API-Key'</span>.</p>
                <pre className="pad-left-20 border-left smaller">
                    POST /api/jhoose/headers HTTP/1.1 <br />
                    Accept: application/json<br />
                    Content-Type: application/json<br />
                    X-API-Key: ...<br />
                    {"{"}
                           'nonce': '1234567890', 
                           'hostName': 'example.com' 
                    {"}"}
                </pre>
                <p>&nbsp;</p>`

                <Tabs defaultActiveKey="1" items={items} />
            </div>
        </>
    )
}

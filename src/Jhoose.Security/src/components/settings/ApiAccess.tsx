import React, { useContext, useEffect, useState } from "react";

import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import { WebHooksUi } from "./Webhooks/WebHooksUi";
import { ApiKeys } from "./ApiKeys/ApiKeys";
import { AuthenticationKey, SecuritySettings } from "../csp/types/types";
import { AppContext } from "../../context";
import { Toaster } from "../toaster";

type Props = {
    settings: SecuritySettings,
    handleUpdate: (settings: SecuritySettings) => void
}

export function ApiAccess() {

    const { state, dispatch } = useContext(AppContext);
  
    useEffect(() =>{
        console.log("dispatch called")
        dispatch({state: state.settings, actionType: "settingsLoad", dispatcher: dispatch })
    }, []);
    
    function handleWebhookUpdate(webhookUrls: string[]) {
        state.settings.settings.webhookUrls = webhookUrls;
        dispatch({state: state.settings, actionType: "settingsSave", dispatcher: dispatch })
    }

    function handleAuthKeysUpdate(authenticationKeys: AuthenticationKey[]) {
        state.settings.settings.authenticationKeys = authenticationKeys;

        dispatch({state: state.settings, actionType: "settingsSave", dispatcher: dispatch })

    }

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'API Keys',
          children: <ApiKeys authenticationKeys={state.settings.settings.authenticationKeys ?? []} handleAuthKeysUpdate={handleAuthKeysUpdate} ></ApiKeys>,
        },
        {
          key: '2',
          label: 'Webhooks',
          children: <WebHooksUi webhookUrls={state.settings.settings.webhookUrls ?? []} handleWebhookUpdate={handleWebhookUpdate}></WebHooksUi>,
        }
      ];

    return(
        
        <>
            <Toaster show={state.settings.loading || state.settings.saving} message={state.settings.loading ? "Loading..." : "Saving..."} />
            <div className="tab-container">
                <p>The following API gives access to the security headers, these can then be used by external sites.  Access is controlled via the <span className="italic bold">'X-API-Key'</span>.</p>
                <pre className="pad-left-20 border-left smaller">
                    POST /api/jhoose/headers HTTP/1.1 <br />
                    Accept: application/json<br />
                    Content-Type: application/json<br />
                    X-API-Key: ...<br />
                    {"{"}'nonce': '1234567890' {"}"}
                </pre>
                <p>&nbsp;</p>`

                <Tabs defaultActiveKey="1" items={items} />
            </div>
        </>
    )
}


import React, { useState } from "react";

import {TabBar,Tab,Typography} from "@episerver/ui-framework";
import {TabContainer} from '../tabContainer';

import { WebHooksUi } from "./Webhooks/WebHooksUi";
import { ApiKeys } from "./ApiKeys";
import { AuthenticationKey, SecuritySettings } from "./types/types";

type Props = {
    settings: SecuritySettings,
    handleUpdate: (settings: SecuritySettings) => void
}

export function ApiAccess(props: Props) {

    const {settings} = {...props}
    var [activeIndex, setActiveIndex] = useState(0);

    function handleWebhookUpdate(webhookUrls: string[]) {
        settings.webhookUrls = webhookUrls;

        props.handleUpdate(settings);

    }

    function handleAuthKeysUpdate(authenticationKeys: AuthenticationKey[]) {
        settings.authenticationKeys = authenticationKeys;

        props.handleUpdate(settings);

    }

    return(
        <div className="tab-container">
            <Typography use="body1">
                <p>The following API gives access to the security headers, these can then be used by external sites.  Access is controlled via the <span className="italic bold">'X-API-Key'</span>.</p>
                <pre className="pad-left-20 border-left smaller">
                    POST /api/jhoose/headers HTTP/1.1 <br/>
                    Accept: application/json<br/>
                    Content-Type: application/json<br/>
                    X-API-Key: ...<br/>
                    {"{"}'nonce': '1234567890' {"}"}
                </pre>
                <p>&nbsp;</p>
            </Typography>
            <TabBar
                activeTabIndex={activeIndex}
                onActivate={evt => setActiveIndex(evt.detail.index)}>
                <Tab>API Keys</Tab>
                <Tab>Webhooks</Tab>
            </TabBar>
            
            <TabContainer index={0} activeIndex={activeIndex}>
                <ApiKeys authenticationKeys={settings.authenticationKeys ?? []} handleAuthKeysUpdate={handleAuthKeysUpdate} ></ApiKeys>
            </TabContainer>
            <TabContainer index={1} activeIndex={activeIndex}>
                <WebHooksUi webhookUrls={settings.webhookUrls ?? []} handleWebhookUpdate={handleWebhookUpdate}></WebHooksUi>
            </TabContainer>
        </div>
    )
}


import React, { useState } from 'react';
import { Alert, Flex, Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';

import { GLOBAL_DEFAULT_SITE_ID, WebsiteSelector } from '../../../components/WebsiteSelector/WebsiteSelector';
import { IpAllowListTab } from '../components/IpAllowListTab/IpAllowListTab';
import { IpIgnoredPathsTab } from '../components/IpIgnoredPathsTab/IpIgnoredPathsTab';
import { IpIgnoreHeadersTab } from '../components/IpIgnoreHeadersTab/IpIgnoreHeadersTab';

import './IpRestrictionsModule.css';

export function IpRestrictionsModule() {
    const { Title } = Typography;

    const [activeWebsiteId, setActiveWebsiteId] = useState<string>(GLOBAL_DEFAULT_SITE_ID);
    const [selectedWebsiteLabel, setSelectedWebsiteLabel] = useState<string>('Global Default');

    const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;

    const items: TabsProps['items'] = [
        {
            key: 'addresses',
            label: 'IP Addresses',
            children: <IpAllowListTab activeWebsiteId={activeWebsiteId} selectedWebsiteLabel={selectedWebsiteLabel} />,
        },
        {
            key: 'ignoredPaths',
            label: 'Ignored Paths',
            children: <IpIgnoredPathsTab activeWebsiteId={activeWebsiteId} selectedWebsiteLabel={selectedWebsiteLabel} />,
        },
        {
            key: 'ignoreHeaders',
            label: 'Ignore Headers',
            children: <IpIgnoreHeadersTab activeWebsiteId={activeWebsiteId} selectedWebsiteLabel={selectedWebsiteLabel} />,
        },
    ];

    return (
        <div className="title">
            <Title level={1}>IP Restrictions</Title>
            <p>
                Restrict access using an allow-list of IPv4/IPv6 addresses and CIDR ranges. Visitors whose address
                isn&apos;t on the effective list receive a 403 Forbidden response.
            </p>

            <Flex gap={12} align="flex-end" className="ip-restrictions__toolbar" wrap>
                <WebsiteSelector
                    value={activeWebsiteId}
                    onChange={setActiveWebsiteId}
                    onSiteChange={(site) => setSelectedWebsiteLabel(site.name)}
                />
            </Flex>

            {!isDefaultWebsite && (
                <Alert
                    className="ip-restrictions__alert"
                    type="info"
                    showIcon
                    message={`${selectedWebsiteLabel} inherits the global settings and lists by default`}
                    description="You can override the mode and add addresses/paths scoped only to this site below, in addition to any global ones."
                />
            )}

            <Tabs items={items} />
        </div>
    );
}

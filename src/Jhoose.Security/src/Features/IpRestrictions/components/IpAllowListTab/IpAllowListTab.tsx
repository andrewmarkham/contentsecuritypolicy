import React, { useEffect, useMemo } from 'react';
import { Alert, Button, Divider, Flex, Popconfirm, Select, Tag, Typography, message } from 'antd';

import { Table } from '../../../../components/DataTable/Table/Table';
import { Header } from '../../../../components/DataTable/Header/Header';
import { Row } from '../../../../components/DataTable/Row/Row';
import { Cell } from '../../../../components/DataTable/Cell/Cell';
import { GLOBAL_DEFAULT_SITE_ID } from '../../../../components/WebsiteSelector/WebsiteSelector';

import { useSettingsQuery, useUpdateSettingsMutation } from '../../../Settings/settingsQueries';
import { SecuritySettings } from '../../../Csp/Types/types';

import {
    getErrorMessage,
    useAddIpRestrictionsMutation,
    useDeleteIpRestrictionMutation,
    useIpRestrictionsQuery,
} from '../../lib/ipRestrictionQueries';
import { IpAddressListInput } from '../IpAddressListInput/IpAddressListInput';

import '../../IpRestrictionsModule/IpRestrictionsModule.css';

type Props = {
    activeWebsiteId: string;
    selectedWebsiteLabel: string;
};

function normalizeSite(site: string): string {
    return site && site.trim().length > 0 ? site : GLOBAL_DEFAULT_SITE_ID;
}

function getModeForSite(settings: SecuritySettings | undefined, siteId: string): 'on' | 'off' {
    if (!settings) {
        return 'off';
    }
    if (siteId !== GLOBAL_DEFAULT_SITE_ID && settings.ipRestrictionModesBySite && settings.ipRestrictionModesBySite[siteId]) {
        return settings.ipRestrictionModesBySite[siteId];
    }
    return settings.ipRestrictionMode ?? 'off';
}

export function IpAllowListTab({ activeWebsiteId, selectedWebsiteLabel }: Props) {
    const { Text } = Typography;

    const [messageApi, contextHolder] = message.useMessage();

    const settingsQuery = useSettingsQuery();
    const updateSettingsMutation = useUpdateSettingsMutation();

    const entriesQuery = useIpRestrictionsQuery();
    const addMutation = useAddIpRestrictionsMutation();
    const deleteMutation = useDeleteIpRestrictionMutation();

    useEffect(() => {
        [settingsQuery.error, updateSettingsMutation.error, entriesQuery.error, addMutation.error, deleteMutation.error]
            .filter(Boolean)
            .forEach((error) => messageApi.error(getErrorMessage(error)));
    }, [messageApi, settingsQuery.error, updateSettingsMutation.error, entriesQuery.error, addMutation.error, deleteMutation.error]);

    const entries = entriesQuery.data ?? [];
    const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;
    const isLoading = settingsQuery.isLoading || settingsQuery.isFetching || entriesQuery.isLoading || entriesQuery.isFetching;

    const mode = getModeForSite(settingsQuery.data, activeWebsiteId);

    const effectiveEntries = useMemo(() => {
        return entries.filter((entry) => {
            const site = normalizeSite(entry.site);
            return site === GLOBAL_DEFAULT_SITE_ID || site === activeWebsiteId;
        });
    }, [entries, activeWebsiteId]);

    const handleModeChange = (value: 'on' | 'off') => {
        const baseSettings: SecuritySettings = settingsQuery.data ?? {
            mode: 'on',
            permissionMode: 'on',
            ipRestrictionMode: 'off',
            reportingMode: 0,
            reportingUrl: '',
            reportToUrl: '',
            webhookUrls: [],
            authenticationKeys: [],
            siteModes: {},
            permissionModesBySite: {},
            ipRestrictionModesBySite: {},
        };

        if (isDefaultWebsite) {
            updateSettingsMutation.mutate({ ...baseSettings, ipRestrictionMode: value });
            return;
        }

        const ipRestrictionModesBySite = { ...(baseSettings.ipRestrictionModesBySite ?? {}), [activeWebsiteId]: value };
        updateSettingsMutation.mutate({ ...baseSettings, ipRestrictionModesBySite });
    };

    const handleAdd = (values: string[]) => {
        addMutation.mutate(
            { site: activeWebsiteId, values },
            {
                onSuccess: (result) => {
                    if (result.created.length > 0) {
                        messageApi.success(`Added ${result.created.length} address${result.created.length === 1 ? '' : 'es'}.`);
                    }
                    if (result.rejected.length > 0) {
                        messageApi.error(`${result.rejected.length} address${result.rejected.length === 1 ? '' : 'es'} could not be saved.`);
                    }
                },
            }
        );
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => messageApi.success('Address removed.'),
        });
    };

    return (
        <>
            {contextHolder}

            <Divider orientation="left">Status</Divider>

            <Flex align="center" gap={16}>
                <Text>Mode:</Text>
                <Select
                    value={mode}
                    style={{ width: 220 }}
                    disabled={isLoading}
                    onChange={handleModeChange}
                    options={[
                        { value: 'off', label: 'Off - IP restriction disabled' },
                        { value: 'on', label: 'On - Only listed addresses allowed' },
                    ]}
                />
            </Flex>

            {mode === 'on' && effectiveEntries.length === 0 && (
                <Alert
                    className="ip-restrictions__alert"
                    type="warning"
                    showIcon
                    message="No addresses are on the allow-list yet"
                    description="Enabling IP restrictions with no addresses configured will block every visitor, including you. Add at least one address below before relying on this."
                />
            )}

            <Divider orientation="left">Add addresses</Divider>

            <IpAddressListInput onAdd={handleAdd} isSubmitting={addMutation.isPending} disabled={isLoading} />

            <Divider orientation="left">Allow-list{isDefaultWebsite ? '' : ` for ${selectedWebsiteLabel}`}</Divider>

            <Table>
                <Header>
                    <Cell>Address / CIDR range</Cell>
                    <Cell width="140px">Scope</Cell>
                    <Cell width="80px">&nbsp;</Cell>
                </Header>

                {effectiveEntries.map((entry) => {
                    const isGlobal = normalizeSite(entry.site) === GLOBAL_DEFAULT_SITE_ID;
                    return (
                        <Row key={entry.id}>
                            <Cell>{entry.value}</Cell>
                            <Cell width="140px">
                                <Tag color={isGlobal ? 'blue' : 'gold'}>{isGlobal ? 'Global default' : 'This site'}</Tag>
                            </Cell>
                            <Cell width="80px" align="right">
                                <Popconfirm
                                    title="Remove this address?"
                                    onConfirm={() => handleDelete(entry.id)}
                                    okText="Remove"
                                    cancelText="Cancel"
                                >
                                    <Button type="link" danger>
                                        Remove
                                    </Button>
                                </Popconfirm>
                            </Cell>
                        </Row>
                    );
                })}
            </Table>
        </>
    );
}

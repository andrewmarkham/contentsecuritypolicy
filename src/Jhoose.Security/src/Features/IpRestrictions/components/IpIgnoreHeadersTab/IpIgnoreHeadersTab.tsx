import React, { useEffect, useMemo } from 'react';
import { Alert, Button, Divider, Popconfirm, Tag, message } from 'antd';

import { Table } from '../../../../components/DataTable/Table/Table';
import { Header } from '../../../../components/DataTable/Header/Header';
import { Row } from '../../../../components/DataTable/Row/Row';
import { Cell } from '../../../../components/DataTable/Cell/Cell';
import { GLOBAL_DEFAULT_SITE_ID } from '../../../../components/WebsiteSelector/WebsiteSelector';

import {
    getErrorMessage,
    useAddIpRestrictionIgnoreHeaderMutation,
    useDeleteIpRestrictionIgnoreHeaderMutation,
    useIpRestrictionIgnoreHeadersQuery,
} from '../../lib/ipRestrictionIgnoreHeaderQueries';
import { IpIgnoreHeaderInput } from '../IpIgnoreHeaderInput/IpIgnoreHeaderInput';

import '../../IpRestrictionsModule/IpRestrictionsModule.css';

type Props = {
    activeWebsiteId: string;
    selectedWebsiteLabel: string;
};

function normalizeSite(site: string): string {
    return site && site.trim().length > 0 ? site : GLOBAL_DEFAULT_SITE_ID;
}

export function IpIgnoreHeadersTab({ activeWebsiteId, selectedWebsiteLabel }: Props) {
    const [messageApi, contextHolder] = message.useMessage();

    const entriesQuery = useIpRestrictionIgnoreHeadersQuery();
    const addMutation = useAddIpRestrictionIgnoreHeaderMutation();
    const deleteMutation = useDeleteIpRestrictionIgnoreHeaderMutation();

    useEffect(() => {
        [entriesQuery.error, addMutation.error, deleteMutation.error]
            .filter(Boolean)
            .forEach((error) => messageApi.error(getErrorMessage(error)));
    }, [messageApi, entriesQuery.error, addMutation.error, deleteMutation.error]);

    const entries = entriesQuery.data ?? [];
    const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;
    const isLoading = entriesQuery.isLoading || entriesQuery.isFetching;

    const effectiveEntries = useMemo(() => {
        return entries.filter((entry) => {
            const site = normalizeSite(entry.site);
            return site === GLOBAL_DEFAULT_SITE_ID || site === activeWebsiteId;
        });
    }, [entries, activeWebsiteId]);

    const handleAdd = (headerName: string, headerValue: string) => {
        addMutation.mutate(
            { headerName, headerValue, site: activeWebsiteId },
            {
                onSuccess: () => messageApi.success('Header added.'),
            }
        );
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => messageApi.success('Header removed.'),
        });
    };

    return (
        <>
            {contextHolder}

            <Alert
                className="ip-restrictions__alert"
                type="info"
                showIcon
                message="Headers listed here bypass the IP allow-list check only"
                description="Requests carrying a header whose name and value match an entry below are never blocked by IP restriction, regardless of mode or the caller's address. This has no effect on CSP, security headers, or the permissions policy."
            />

            <Divider orientation="left">Add ignore header</Divider>

            <IpIgnoreHeaderInput onAdd={handleAdd} isSubmitting={addMutation.isPending} disabled={isLoading} />

            <Divider orientation="left">Ignore headers{isDefaultWebsite ? '' : ` for ${selectedWebsiteLabel}`}</Divider>

            <Table>
                <Header>
                    <Cell>Header name</Cell>
                    <Cell>Header value</Cell>
                    <Cell width="140px">Scope</Cell>
                    <Cell width="80px">&nbsp;</Cell>
                </Header>

                {effectiveEntries.map((entry) => {
                    const isGlobal = normalizeSite(entry.site) === GLOBAL_DEFAULT_SITE_ID;
                    return (
                        <Row key={entry.id}>
                            <Cell>{entry.headerName}</Cell>
                            <Cell>{entry.headerValue}</Cell>
                            <Cell width="140px">
                                <Tag color={isGlobal ? 'blue' : 'gold'}>{isGlobal ? 'Global default' : 'This site'}</Tag>
                            </Cell>
                            <Cell width="80px" align="right">
                                <Popconfirm
                                    title="Remove this header?"
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

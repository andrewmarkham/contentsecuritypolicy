import React, { useEffect, useMemo } from 'react';
import { Alert, Button, Divider, Popconfirm, Tag, message } from 'antd';

import { Table } from '../../../../components/DataTable/Table/Table';
import { Header } from '../../../../components/DataTable/Header/Header';
import { Row } from '../../../../components/DataTable/Row/Row';
import { Cell } from '../../../../components/DataTable/Cell/Cell';
import { GLOBAL_DEFAULT_SITE_ID } from '../../../../components/WebsiteSelector/WebsiteSelector';

import {
    getErrorMessage,
    useAddIpRestrictionIgnoredPathsMutation,
    useDeleteIpRestrictionIgnoredPathMutation,
    useIpRestrictionIgnoredPathsQuery,
} from '../../lib/ipRestrictionIgnoredPathQueries';
import { IpPathListInput } from '../IpPathListInput/IpPathListInput';

import '../../IpRestrictionsModule/IpRestrictionsModule.css';

type Props = {
    activeWebsiteId: string;
    selectedWebsiteLabel: string;
};

function normalizeSite(site: string): string {
    return site && site.trim().length > 0 ? site : GLOBAL_DEFAULT_SITE_ID;
}

export function IpIgnoredPathsTab({ activeWebsiteId, selectedWebsiteLabel }: Props) {
    const [messageApi, contextHolder] = message.useMessage();

    const entriesQuery = useIpRestrictionIgnoredPathsQuery();
    const addMutation = useAddIpRestrictionIgnoredPathsMutation();
    const deleteMutation = useDeleteIpRestrictionIgnoredPathMutation();

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

    const handleAdd = (values: string[]) => {
        addMutation.mutate(
            { site: activeWebsiteId, values },
            {
                onSuccess: (result) => {
                    if (result.created.length > 0) {
                        messageApi.success(`Added ${result.created.length} path${result.created.length === 1 ? '' : 's'}.`);
                    }
                    if (result.rejected.length > 0) {
                        messageApi.error(`${result.rejected.length} path${result.rejected.length === 1 ? '' : 's'} could not be saved.`);
                    }
                },
            }
        );
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => messageApi.success('Path removed.'),
        });
    };

    return (
        <>
            {contextHolder}

            <Alert
                className="ip-restrictions__alert"
                type="info"
                showIcon
                message="Paths listed here bypass the IP allow-list check only"
                description="Requests to a matching path (matched by path prefix, e.g. &quot;/webhooks&quot; also matches &quot;/webhooks/stripe&quot;) are never blocked by IP restriction, regardless of mode or the caller's address. This has no effect on CSP, security headers, or the permissions policy."
            />

            <Divider orientation="left">Add ignored paths</Divider>

            <IpPathListInput onAdd={handleAdd} isSubmitting={addMutation.isPending} disabled={isLoading} />

            <Divider orientation="left">Ignored paths{isDefaultWebsite ? '' : ` for ${selectedWebsiteLabel}`}</Divider>

            <Table>
                <Header>
                    <Cell>Path prefix</Cell>
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
                                    title="Remove this path?"
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

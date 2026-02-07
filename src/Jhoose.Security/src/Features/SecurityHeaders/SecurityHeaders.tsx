import React, { useEffect, useMemo, useState } from 'react';
import { EditSecurityHeader } from './EditSecurityHeader';
import { getLabelForHeaderOption } from './SecurityHeaderHelper';

import { SecurityHeader } from './Types/securityHeader';
import { Table } from '../../components/DataTable/Table';
import { Row } from '../../components/DataTable/Row';
import { Cell } from '../../components/DataTable/Cell';
import { Header } from '../../components/DataTable/Header';
import { Alert, Flex, Tag, Typography, message } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

import { Toaster } from '../../components/Toaster';
import { getErrorMessage, useSecurityHeadersQuery } from './securityHeaderQueries';
import { useIsMutating } from '@tanstack/react-query';
import { WebsiteSelector, GLOBAL_DEFAULT_SITE_ID } from '../../components/WebsiteSelector/WebsiteSelector';
import { SiteOverrideAlert } from '../../components/SiteOverrideAlert/SiteOverrideAlert';

type Props = {
    data: SecurityHeader[],
    disabled: boolean,
    save: (data: any) => void,
    setTitle: (title: string) => void
}

export function SecurityHeaders() {

    const { Title } = Typography;
    
    const dummy = { "id": "-1", "name": "", "enabled": true, "mode": 0, "value": "" };

    const [messageApi, contextHolder] = message.useMessage();
    const headersQuery = useSecurityHeadersQuery();
    const savingCount = useIsMutating({ mutationKey: ['securityHeader'] });

    const [currentHeader, setCurrentHeader] = useState<SecurityHeader>(dummy);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeWebsiteId, setActiveWebsiteId] = useState<string>(GLOBAL_DEFAULT_SITE_ID);
    const [selectedWebsiteLabel, setSelectedWebsiteLabel] = useState<string>('Global Default');

    function closeModal() {
       setIsModalOpen(false);
    }

    function getValue(row: SecurityHeader): string  {

        if (row.name === "X-Content-Type-Options") {
            return row.value ?? "";
        }

        if (row.name === "Strict-Transport-Security") { 
            return `includeSubDomains : ${row.includeSubDomains}; maxage : ${row.maxAge}`
        }
        
        if (row.name === "X-Frame-Options") { 

            var modelLabel = getLabelForHeaderOption(row.name, row.mode);

            if (row.domain != null && row.domain !== "") 
                return `${modelLabel}; domain : ${row.domain}`;
            else
                return modelLabel ?? "";
        }

        if (row.mode !== undefined) {
            return getLabelForHeaderOption(row.name, row.mode);
        }

        return "";
    }

    function getSource(header: SecurityHeader, hasOverride: boolean) {
        if (isDefaultWebsite) {
            return "default";
        }
        return hasOverride ? "overridden" : "inherited";
    }

    useEffect(() => {
        if (headersQuery.error) {
            messageApi.error(getErrorMessage(headersQuery.error));
        }
    }, [headersQuery.error, messageApi]);

    const headers = headersQuery.data?.headers ?? [];
    const isDefaultWebsite = activeWebsiteId === GLOBAL_DEFAULT_SITE_ID;
    const headersBySite = useMemo(() => {
        return headers.reduce((acc, header) => {
            const normalizedSite = (header.site ?? '').trim() || GLOBAL_DEFAULT_SITE_ID;
            if (!acc[normalizedSite]) {
                acc[normalizedSite] = {};
            }
            acc[normalizedSite][header.name] = header;
            return acc;
        }, {} as Record<string, Record<string, SecurityHeader>>);
    }, [headers]);

    const defaultHeadersByName = headersBySite[GLOBAL_DEFAULT_SITE_ID] ?? {};
    const siteHeadersByName = headersBySite[activeWebsiteId] ?? {};
    const overrideCount = Object.keys(siteHeadersByName).length;
    
    return (
        <>
        {contextHolder}
        <Toaster
            show={headersQuery.isLoading || headersQuery.isFetching || savingCount > 0}
            message={headersQuery.isLoading || headersQuery.isFetching ? "Loading..." : "Saving..."}
        />
        <div className="title">
            <Title level={2}>Security Headers</Title>
            <p>&nbsp;</p>
        </div>
        <div className="tab-container">
                <Flex gap={12} align="flex-end" style={{marginBottom: "14px"}} wrap>
                    <WebsiteSelector
                        value={activeWebsiteId}
                        onChange={setActiveWebsiteId}
                        onSiteChange={(site) => setSelectedWebsiteLabel(site.name)}
                    />
                </Flex>

                {!isDefaultWebsite && (
                    <Alert
                        style={{marginBottom: "14px"}}
                        type="info"
                        showIcon
                        message={`${selectedWebsiteLabel} inherits from Global Default by default`}
                        description={`${overrideCount} header override${overrideCount === 1 ? "" : "s"} configured for this website.`}
                    />
                )}
                <Table>
                        <Header>
                            <Cell width="300px">Header</Cell>
                            <Cell>Configuration</Cell>
                            <Cell width="70px">Source</Cell>
                            <Cell width="100px" align='right'>Enabled</Cell>
                        </Header>

                        {Object.values(defaultHeadersByName).map((defaultHeader : SecurityHeader) => {
                            const overrideHeader = !isDefaultWebsite ? siteHeadersByName[defaultHeader.name] : undefined;
                            const header = overrideHeader ?? defaultHeader;
                            const source = getSource(header, !!overrideHeader);
                            return (
                                <Row key={header.id}>
                                    <Cell width="300px">
                                        <button className="linkButton" onClick={() => {
                                            setIsModalOpen(true);
                                            setCurrentHeader(header);
                                        }}>{header.name}</button>
                                    </Cell>
                                    <Cell>{getValue(header)}</Cell>
                                    <Cell width="70px">
                                        <SourceTag source={source} />
                                    </Cell>
                                    <Cell width="100px" align='right'> {header.enabled ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <></>} </Cell>
                                </Row>
                            );
                        })}

                </Table>

                <EditSecurityHeader
                    close={() => closeModal()}
                    isOpen={isModalOpen}
                    header={currentHeader}
                    siteId={activeWebsiteId}
                    siteName={selectedWebsiteLabel}
                    source={isDefaultWebsite ? "default" : ((currentHeader.site ?? '') === activeWebsiteId ? "overridden" : "inherited")}
                    inheritedHeader={defaultHeadersByName[currentHeader.name] ?? null}
                />
        </div>
        </>
    );
}

function SourceTag(props: { source: "default" | "inherited" | "overridden" }) {
    switch (props.source) {
        case "default":
            return <Tag color="blue">Global default</Tag>;
        case "overridden":
            return <Tag color="gold">Overridden</Tag>;
        default:
            return <Tag>Inherited</Tag>;
    }
}

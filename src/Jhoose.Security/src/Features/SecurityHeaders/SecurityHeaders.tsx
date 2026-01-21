import React, { useEffect, useState } from 'react';
import { EditSecurityHeader } from './EditSecurityHeader';
import { getLabelForHeaderOption } from './SecurityHeaderHelper';

import { SecurityHeader } from './Types/securityHeader';
import { Table } from '../../components/DataTable/Table';
import { Row } from '../../components/DataTable/Row';
import { Cell } from '../../components/DataTable/Cell';
import { Header } from '../../components/DataTable/Header';
import { Typography, message } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

import { Toaster } from '../../components/Toaster';
import { getErrorMessage, useSecurityHeadersQuery } from './securityHeaderQueries';
import { useIsMutating } from '@tanstack/react-query';

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

    useEffect(() => {
        if (headersQuery.error) {
            messageApi.error(getErrorMessage(headersQuery.error));
        }
    }, [headersQuery.error, messageApi]);
    
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
                <Table>
                        <Header>
                            <Cell width="300px">Header</Cell>
                            <Cell>Configuration</Cell>
                            <Cell width="100px" align='right'>Enabled</Cell>
                        </Header>

                        {headersQuery.data?.headers?.map((r : SecurityHeader) => {
                            return (
                                <Row key={r.id}>
                                    <Cell width="300px">
                                        <button className="linkButton" onClick={() => {
                                            setIsModalOpen(true);
                                            setCurrentHeader(r);
                                        }}>{r.name}</button>
                                    </Cell>
                                    <Cell>{getValue(r)}</Cell>
                                    <Cell width="100px" align='right'> {r.enabled ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <></>} </Cell>
                                </Row>
                            );
                        })}

                </Table>

                <EditSecurityHeader
                    close={() => closeModal()}
                    isOpen={isModalOpen}
                    header={currentHeader} />
        </div>
        </>
    );
}



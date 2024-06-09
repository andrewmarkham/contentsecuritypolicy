import React, { useContext, useEffect, useState } from 'react';
import { EditSecurityHeader } from './EditSecurityHeader';
import { getLabelForHeaderOption } from './SecurityHeaderHelper';

import { SecurityHeader } from './types/securityHeader';
import { Table } from '../DataTable/Table';
import { Row } from '../DataTable/Row';
import { Cell } from '../DataTable/Cell';
import { Header } from '../DataTable/Header';
import { AppContext } from '../../context';
import { Typography } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

type Props = {
    data: SecurityHeader[],
    disabled: boolean,
    save: (data: any) => void,
    setTitle: (title: string) => void
}

export function SecurityHeaders() {

    const { Title } = Typography;
    
    const dummy = { "id": "-1", "name": "", "enabled": true, "mode": 0, "value": "" };

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

    const { state, dispatch } = useContext(AppContext);

    useEffect(() =>{
        console.log("dispatch called")
        dispatch({state: state.headers, actionType: "headerLoad", dispatcher: dispatch })
    }, []);
    

    return (
        <>
        <div className="title">
            <Title level={2}>Security Headers</Title>
            <p>&nbsp;</p>
        </div>
        <div className="tab-container">
                <Table>
                        <Header>
                            <Cell width="300px">Header</Cell>
                            <Cell>Configuration</Cell>
                            <Cell width="100px">Enabled</Cell>
                        </Header>

                        {state.headers.data?.map((r : SecurityHeader) => {
                            return (
                                <Row key={r.id}>
                                    <Cell width="300px">
                                        <button className="linkButton" onClick={() => {
                                            
                                            //setCurrentHeader(r);
                                            setIsModalOpen(true);
                                            setCurrentHeader(r);

                                            /*
                                            setTimeout(() => 
                                                {
                                                    setIsModalOpen(true);
                                                },
                                                500);
                                            */
                                            
                                            //console.log(r.name, isModalOpen)
                                        }}>{r.name}</button>
                                    </Cell>
                                    <Cell>{getValue(r)}</Cell>
                                    <Cell width="100px"> {r.enabled ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <></>} </Cell>
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




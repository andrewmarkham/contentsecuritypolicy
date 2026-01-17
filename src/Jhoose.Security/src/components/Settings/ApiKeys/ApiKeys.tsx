import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';


import { Typography } from "antd";

import { AuthenticationKey } from "../../csp/types/types";
import { ApplicationKeyAdd } from "./ApplicationKeyAdd";
import { ApplicationKeyItem } from "./ApplicationKeyItem";
import { Table } from "../../DataTable/Table";
import { Cell } from "../../DataTable/Cell";
import { Header } from "../../DataTable/Header";
import { Row } from "../../DataTable/Row";


type Props = {
    authenticationKeys: AuthenticationKey[],
    handleAuthKeysUpdate: (data: AuthenticationKey[]) => void
}

export function ApiKeys(props: Props) {
    const [authenticationKeys, setAuthenticationKeys] = useState<AuthenticationKey[]>(props.authenticationKeys);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { Title, Paragraph, Text, Link } = Typography;

    function handleUpdate(index: number, value: string) {

        var newAuthenticationKeys:AuthenticationKey[]  = [...authenticationKeys];

        newAuthenticationKeys[index].name = value;

        props.handleAuthKeysUpdate(newAuthenticationKeys);
        setAuthenticationKeys(newAuthenticationKeys);
        setIsAddOpen(false);
    }

    function handleRevoke(index: number) {
        authenticationKeys[index].revoked = true;

        props.handleAuthKeysUpdate(authenticationKeys);
        setAuthenticationKeys(authenticationKeys);
        setIsAddOpen(false);
    }

    function handleDelete(index: number) {
        var newAuthenticationKeys = authenticationKeys.splice(index, 1);
        props.handleAuthKeysUpdate(authenticationKeys);
        setAuthenticationKeys(authenticationKeys);
        setIsAddOpen(false);
    }

    function handleAdd() {
        const newauthenticationKeys = [...authenticationKeys];
        newauthenticationKeys.push(
            {
                name: "",
                key: btoa(uuidv4()),
                revoked: false
            }
        );
        setAuthenticationKeys(newauthenticationKeys);
        setIsAddOpen(true);
    }

    return (
        <>
            <div className="tab-container">
                <Title level={3}>Authentication Keys</Title>
                <Paragraph>
                    Create authentication keys to gain access to the API.
                </Paragraph>

                <Table>
                    <Header>
                        <Cell width="25%">Name</Cell>
                        <Cell>Api Key</Cell>
                        <Cell align="right" width="200px">&nbsp;</Cell>
                    </Header>

                    {authenticationKeys?.map((w, index) => {
                                return <ApplicationKeyItem
                                    key={index}
                                    item={w}
                                    index={index}
                                    isNewRecord={w.name === ""}
                                    isAddOpen={isAddOpen}
                                    handleUpdate={handleUpdate}
                                    handleDelete={handleDelete}
                                    handleRevoke={handleRevoke} />;
                            })}
                </Table>
            </div>

            <ApplicationKeyAdd disabled={isAddOpen} handleAdd={handleAdd} />
        </>
    );
}



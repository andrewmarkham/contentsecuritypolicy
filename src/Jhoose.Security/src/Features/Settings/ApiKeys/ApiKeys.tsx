import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';


import { Form, Input, Modal, Select, Typography } from "antd";

import { AuthenticationKey } from "../../Csp/Types/types";
import { ApplicationKeyAdd } from "./ApplicationKeyAdd";
import { ApplicationKeyItem } from "./ApplicationKeyItem";
import { Table } from "../../../components/DataTable/Table";
import { Cell } from "../../../components/DataTable/Cell";
import { Header } from "../../../components/DataTable/Header";
import { Row } from "../../../components/DataTable/Row";
import { useSitesQuery } from "../settingsQueries";
import { GLOBAL_DEFAULT_SITE_ID } from "../../../components/WebsiteSelector/WebsiteSelector";


type Props = {
    authenticationKeys: AuthenticationKey[],
    handleAuthKeysUpdate: (data: AuthenticationKey[]) => void
}

export function ApiKeys(props: Props) {
    const [authenticationKeys, setAuthenticationKeys] = useState<AuthenticationKey[]>(normalizeKeys(props.authenticationKeys));
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [modal, modalContextHolder] = Modal.useModal();
    const [form] = Form.useForm();
    const sitesQuery = useSitesQuery();

    const { Title, Paragraph, Text, Link } = Typography;

    useEffect(() => {
        setAuthenticationKeys(normalizeKeys(props.authenticationKeys));
    }, [props.authenticationKeys]);

    const siteOptions = useMemo(() => {
        const sites = sitesQuery.data ?? [];
        const hasGlobalDefault = sites.some((site) => site.id === GLOBAL_DEFAULT_SITE_ID);
        const options = sites.map((site) => ({
            value: site.id,
            label: site.name,
        }));

        if (hasGlobalDefault) {
            return options;
        }

        return [{ value: GLOBAL_DEFAULT_SITE_ID, label: "Global Default" }, ...options];
    }, [sitesQuery.data]);

    const siteNameById = useMemo(() => {
        const map = new Map<string, string>();
        siteOptions.forEach((option) => {
            map.set(option.value, option.label);
        });
        return map;
    }, [siteOptions]);

    function handleUpdate(index: number, value: string, siteId?: string) {

        var newAuthenticationKeys:AuthenticationKey[]  = [...authenticationKeys];

        newAuthenticationKeys[index].name = value;
        if (siteId) {
            newAuthenticationKeys[index].site = siteId;
        } else if (!newAuthenticationKeys[index].site) {
            newAuthenticationKeys[index].site = GLOBAL_DEFAULT_SITE_ID;
        }

        props.handleAuthKeysUpdate(newAuthenticationKeys);
        setAuthenticationKeys(newAuthenticationKeys);
        setIsAddOpen(false);
    }

    function handleSiteChange(index: number, siteId: string) {
        var newAuthenticationKeys:AuthenticationKey[]  = [...authenticationKeys];
        newAuthenticationKeys[index].site = siteId;
        setAuthenticationKeys(newAuthenticationKeys);
    }

    function handleRevoke(index: number) {
        authenticationKeys[index].revoked = true;

        props.handleAuthKeysUpdate(authenticationKeys);
        setAuthenticationKeys(authenticationKeys);
        setIsAddOpen(false);
    }

    function handleRevokeConfirm(index: number) {
        modal.confirm({
            title: "Revoke API key?",
            content: "This key will no longer be valid. You can delete it afterwards if needed.",
            okText: "Revoke",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => handleRevoke(index),
        });
    }

    function handleDelete(index: number) {
        var newAuthenticationKeys = authenticationKeys.splice(index, 1);
        props.handleAuthKeysUpdate(authenticationKeys);
        setAuthenticationKeys(authenticationKeys);
        setIsAddOpen(false);
    }

    function handleAdd() {
        form.setFieldsValue({
            name: "",
            site: GLOBAL_DEFAULT_SITE_ID
        });
        setIsAddOpen(true);
    }

    function handleAddConfirm() {
        form
            .validateFields()
            .then((values) => {
                const newKey: AuthenticationKey = {
                    name: values.name,
                    key: btoa(uuidv4()),
                    revoked: false,
                    site: values.site ?? GLOBAL_DEFAULT_SITE_ID
                };
                const newAuthenticationKeys = [...authenticationKeys, newKey];
                props.handleAuthKeysUpdate(newAuthenticationKeys);
                setAuthenticationKeys(newAuthenticationKeys);
                setIsAddOpen(false);
            })
            .catch(() => {
                return;
            });
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
                        <Cell width="20%">Site</Cell>
                        <Cell>Api Key</Cell>
                        <Cell align="right" width="200px">&nbsp;</Cell>
                    </Header>

                    {authenticationKeys?.map((w, index) => {
                                return <ApplicationKeyItem
                                    key={index}
                                    item={w}
                                    index={index}
                                    isNewRecord={false}
                                    isAddOpen={isAddOpen}
                                    siteOptions={siteOptions}
                                    siteName={siteNameById.get(w.site ?? GLOBAL_DEFAULT_SITE_ID) ?? w.site ?? "Global Default"}
                                    handleUpdate={handleUpdate}
                                    handleSiteChange={handleSiteChange}
                                    handleDelete={handleDelete}
                                    handleRevoke={handleRevokeConfirm} />;
                            })}
                </Table>
            </div>

            <ApplicationKeyAdd disabled={isAddOpen} handleAdd={handleAdd} />
            <Modal
                title="Add API Key"
                open={isAddOpen}
                onOk={handleAddConfirm}
                onCancel={() => setIsAddOpen(false)}
                okText="Add"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter a name" }]}
                    >
                        <Input placeholder="Enter name of API Key" />
                    </Form.Item>
                    <Form.Item label="Site" name="site">
                        <Select options={siteOptions} />
                    </Form.Item>
                </Form>
            </Modal>
            {modalContextHolder}
        </>
    );
}

function normalizeKeys(keys: AuthenticationKey[]) {
    return keys.map((key) => ({
        ...key,
        site: key.site ?? GLOBAL_DEFAULT_SITE_ID,
    }));
}

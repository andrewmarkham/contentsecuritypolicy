import React, { useState } from "react";

import { Typography } from 'antd';

import { WebHookItem } from "./WebHookItem";
import { WebHookAdd } from "./WebHookAdd";
import { Table } from "../../DataTable/Table";
import { Cell } from "../../DataTable/Cell";
import { Header } from "../../DataTable/Header";


type Props = {
    webhookUrls: string[],
    handleWebhookUpdate: (data: string[]) => void
}

export function WebHooksUi(props: Props) {

    const { Title, Paragraph} = Typography;

    const [webhookUrls, setWebhookUrls] = useState<Array<string>>(props.webhookUrls);
    const [isAddOpen, setIsAddOpen] = useState(false);

    function handleUpdate(index: number, value: string) {
        webhookUrls[index] = value;

        props.handleWebhookUpdate(webhookUrls);
        setWebhookUrls(webhookUrls);
        setIsAddOpen(false);
    }

    function handleDelete(index: number) {
        var newWebhookUrls = webhookUrls.splice(index, 1);

        props.handleWebhookUpdate(webhookUrls);
        setWebhookUrls(webhookUrls);
        setIsAddOpen(false);
    }

    function handleAdd() {
        const newWebhookUrls = [...webhookUrls];
        newWebhookUrls.push("");
        setWebhookUrls(newWebhookUrls);
        setIsAddOpen(true);
    }

    const columns = [
        {
          title: 'Webhook Url',
          dataIndex: 'name',
          key: 'name',
        }
      ];

    return (
        <>
            <div className="tab-container">
                <Title level={3}>Webhooks</Title>
                <Paragraph>
                    Register webhooks to recieve notification to any updates to the security headers.
                </Paragraph>

                <Table>
                        <Header>
                            <Cell>Webhook Url</Cell>
                            <Cell width="200px">&nbsp;</Cell>
                        </Header>
                            {webhookUrls?.map((w: string, index: number) => {
                                return <WebHookItem
                                    key={index}
                                    item={w}
                                    index={index}
                                    isNewRecord={w === ""}
                                    isAddOpen={isAddOpen}
                                    handleUpdate={handleUpdate}
                                    handleDelete={handleDelete} />;
                            })}
                    </Table>
            </div>
            <WebHookAdd handleAdd={handleAdd} disabled={isAddOpen} />
        </>
    );
}



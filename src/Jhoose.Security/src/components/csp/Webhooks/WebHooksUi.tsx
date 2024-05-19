import React, { useState } from "react";
import {
    Typography,
    DataTable, DataTableContent, DataTableHeaderRow, DataTableColumnHeaderCell, DataTableBody} from "@episerver/ui-framework";
import { WebHookItem } from "./WebHookItem";
import { WebHookAdd } from "./WebHookAdd";


type Props = {
    webhookUrls: string[],
    handleWebhookUpdate: (data: string[]) => void
}

export function WebHooksUi(props: Props) {
    const [webhookUrls, setWebhookUrls] = useState(props.webhookUrls);
    const [isAddOpen, setIsAddOpen] = useState(false);

    function handleUpdate(index: number, value: string) {
        webhookUrls[index] = value;

        props.handleWebhookUpdate(webhookUrls);
        setWebhookUrls(webhookUrls);
        setIsAddOpen(false);
    }

    function handleDelete(index: number) {
        var newWebhookUrls = webhookUrls.splice(index, 1);

        props.handleWebhookUpdate(newWebhookUrls);
        setWebhookUrls(newWebhookUrls);
        setIsAddOpen(false);
    }

    function handleAdd() {
        const newWebhookUrls = [...webhookUrls];
        newWebhookUrls.push("");
        setWebhookUrls(newWebhookUrls);
        setIsAddOpen(true);
    }

    return (
        <>
            <div className="tab-container">
                <Typography use="headline3">
                    <h3>Webhooks</h3>
                </Typography>
                <Typography use="body1">
                    <p>Register webhooks to recieve notification to any updates to the security headers.</p>
                </Typography>
                <DataTable>
                    <DataTableContent>
                        <DataTableHeaderRow>
                            <DataTableColumnHeaderCell>
                                Webhook Url
                            </DataTableColumnHeaderCell>
                            <DataTableColumnHeaderCell>
                                &nbsp;
                            </DataTableColumnHeaderCell>
                        </DataTableHeaderRow>

                        <DataTableBody>
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
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>
            </div>
            <WebHookAdd handleAdd={handleAdd} disabled={isAddOpen} />
        </>
    );
}



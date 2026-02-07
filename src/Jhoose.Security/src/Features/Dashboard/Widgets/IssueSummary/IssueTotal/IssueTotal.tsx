import React from "react";
import { Skeleton } from 'antd';
import { DeliveredProcedureOutlined } from "@ant-design/icons";

export type IssueTotalProps = {
    isLoading: boolean;
    title: string;
    total?: number;

}

export const IssueTotal = (props: IssueTotalProps) => {
    return (
        <>
            <span className="issuelabel">{props.title}</span>
            <span className="value">
                {props.isLoading ? <Skeleton.Input active size="large" /> : props?.total}
            </span>
        </>
    );
};

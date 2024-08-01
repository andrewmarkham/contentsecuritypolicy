import React from "react";
import { Empty, Spin } from 'antd';
import { Line } from '@ant-design/plots';
import { LoadingOutlined } from '@ant-design/icons';
import { IssueMetric } from "./types";

export type IssueGraphProps = {
    isLoading: boolean;
    isEmpty: boolean;
    graphData?: IssueMetric[];
}

export const IssueGraph = (props: IssueGraphProps) => {

    const config = {
        data: props.graphData,
        xField: (d: any) => new Date(d.time),
        yField: 'value',
        sizeField: 'value',
        shapeField: 'trail',
        legend: { size: false },
        colorField: 'metric',
    };

    return (props.isEmpty
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No issues Found" />
        : <Spin indicator={<LoadingOutlined style={{ fontSize: 96 }} spin />} spinning={props.isLoading}><Line {...config} /></Spin>);
};

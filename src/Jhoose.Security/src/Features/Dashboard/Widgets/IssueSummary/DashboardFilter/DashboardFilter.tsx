import React from "react";
import { Flex, Radio, Typography } from 'antd';
import { CheckboxChangeEvent } from "antd/es/checkbox";

export type DashboardFilterProps = {
    title: string;
    filters: {label: string, value: string}[]
    onChange: (value: string) => void;
}


export const DashboardFilter = (props: DashboardFilterProps) => {
    const defaultValue = props.filters[0]?.value;
    const { Title } = Typography;

    return (

        <Flex vertical>
            <Title level={5}>{props.title}</Title>
            <Radio.Group defaultValue={defaultValue} buttonStyle="solid" size="small" onChange={(e: CheckboxChangeEvent) => props.onChange(e.target.value)}>
                {props.filters.map((filter,index) => <Radio.Button key={index} value={filter.value}>{filter.label}</Radio.Button>
                )};
            </Radio.Group>
        </Flex>
    );

};

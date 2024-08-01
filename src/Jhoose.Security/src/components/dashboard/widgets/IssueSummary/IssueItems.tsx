import React from "react";
import { Empty, Skeleton } from 'antd';
import { IssueItem } from "./types";

export type IssueItemsProps = {
    isLoading: boolean;
    title: string;
    issues?: IssueItem[];
}

export const IssueItems = (props: IssueItemsProps) => {
    var isEmpty = props.issues?.length === 0;
    return (
        <Skeleton loading={props.isLoading} active>
            <span className="issuelabel">{props.title}</span>
            {isEmpty
                ? (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No issues Found" />)
                : (
                    <ul>
                        {props.issues?.map((issue, index) => {
                            return (
                                <li key={index}><a href={issue.url} title={issue.name}>{issue.name}</a><span>{issue.count}</span></li>
                            );
                        })}
                    </ul>)}
        </Skeleton>
    );
};

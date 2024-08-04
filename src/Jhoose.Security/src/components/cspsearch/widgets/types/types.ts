import { GetProp, TableProps } from "antd";
import { SorterResult } from "antd/es/table/interface";

export type ColumnsType<T> = TableProps<T>['columns'];
export type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

export interface RowDataType {
  id: string;
  age: number;
  recievedAt: Date;
  type: string;
  url: string;
  user_agent: string;
  browser: string;
  version: string;
  os: string;
  directive: string;
  blockedUri: string;
  body: {
    documentURL: string;
    disposition: string;
    referrer: string;
    effectiveDirective: string;
    blockedURL: string;
    originalPolicy: string;
    statusCode: number;
    sample: string;
    sourceFile: string;
    lineNumber: number;
    columnNumber: number;
  };
}

export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
}

export type SelectValue = { label: string, value: string }

export type SearchParams = {
  dateFrom?: Date,
  browser?: Array<string>,
  directive?: Array<string>,
  query?: string
}
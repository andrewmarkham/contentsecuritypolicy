import type { SorterResult } from 'antd/es/table/interface';
import type { TablePaginationConfig } from './TablePaginationConfig';

export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
}

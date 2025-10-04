
import React, { useEffect, useRef, useState } from 'react';

import { Flex} from 'antd';

import type { TableProps } from 'antd';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';

import { format } from "date-fns";
import { useSearchParams } from 'react-router-dom';
import { SearchParams, SelectValue, RowDataType, TableParams} from './types/types';

import { IssueSearchForm } from './IssueSearchForm';

const columns: ColumnsType<RowDataType> = [
  {
    title: 'Recieved At',
    dataIndex: 'recievedAt',
    sorter: true,
    defaultSortOrder: 'descend',
    sortDirections: ['ascend','descend', 'ascend'],
    render: (value: Date) => format(value, 'yyyy-MM-dd HH:mm:ss'),
    width: '180px',
  },
  {
    title: 'Url',
    dataIndex: 'url'
  },
  {
    title: 'Browser',
    dataIndex: 'browser',
    width: '100px'
  },
  {
    title: 'Directive',
    dataIndex: 'directive',
    width: '160px',
  },
  {
    title: 'Blocked Uri',
    dataIndex: 'blockedUri',
  }
];

export function IssueSearch() {

  const [handledInitialPageLoad,setHandledInitialPageLoad] = useState(false);

  const [data, setData] = useState<RowDataType[]>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    sortOrder: 'descend',
    sortField: 'recievedAt',
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const [searchQuery, setSearchQuery] = useState<SearchParams>({
    directive: [],
    query: ''
  });

  const [directiveOptions, setDirectiveOptions] = useState<Array<SelectValue>>([]);
  const [browserOptions, setBrowserOptions] = useState<Array<SelectValue>>([]);

  function onSearch(searchParams: SearchParams) {
    setSearchQuery(searchParams);
  }

  const [searchParams] = useSearchParams();

  const fetchData = () => {

    setLoading(true);

    fetch(`/api/jhoose/dashboard/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getSearchParams(tableParams))
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data.results);
        setLoading(false);
        setTableParams({
          sortOrder: tableParams.sortOrder ?? "descend",
          sortField: tableParams.sortField ?? "recievedAt",
          pagination: {
            ...tableParams.pagination,
            total: data.total
          }
        });
        setDirectiveOptions(data.directives.map((d: string) => ({ label: d, value: d })));
        setBrowserOptions(data.browsers.map((b: string) => ({ label: b, value: b })));
      });
  };

  useEffect(() => {
    if (!handledInitialPageLoad) {
      setSearchQuery({
        directive: [searchParams.get('directive') || ''],
        query: searchParams.get('page') || ''
      });
      setHandledInitialPageLoad(true);
    }
    
  },[]);

  useEffect(() => {
    if (handledInitialPageLoad && loading == false) {
      fetchData();
    }
  }, [
    handledInitialPageLoad,
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder ?? 'descend',
    tableParams?.sortField,
    JSON.stringify(searchQuery),
  ]);

  const getSearchParams = (params: TableParams) => ({
    pageSize: params.pagination?.pageSize,
    page: params.pagination?.current,
    sortOrder: params.sortOrder,
    sortField: params.sortField,
    filters: searchQuery
  });

  const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
    console.log(sorter);
    setTableParams({
      pagination,
      sortOrder: Array.isArray(sorter) ? "descend" : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  return (
    <>
      <Flex gap='small' justify='flex-end' style={{ padding: '1rem' }}>
        <IssueSearchForm
          loading={loading}
          directives={directiveOptions}
          initialDirective={searchParams.get('directive')}
          browsers={browserOptions}
          initialQuery={searchParams.get('page')}
          onSearch={onSearch} />
      </Flex>
      <Table
        columns={columns}
        sortDirections={['ascend','descend','ascend']}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </>
  );
}




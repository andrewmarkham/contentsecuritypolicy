
import React from 'react';

import { Tabs, Typography } from 'antd';
import type { TabsProps } from 'antd';

import {CspDataGrid} from './CspDataGrid';
import {CspSettings} from './CspSettings';
import { ApiAccess } from './ApiAccess';

export function CspModule() {

    const { Title } = Typography;

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Content Security Policy',
          children: <CspDataGrid />,
        },
        {
          key: '2',
          label: 'Settings',
          children: <CspSettings /> ,
        },
        {
          key: '3',
          label: 'Api Access',
          children: <ApiAccess  />,
        }
      ];
    return(
        <>
            <div className="title">
              <Title level={2}>Content Security Policy</Title>
              <p>&nbsp;</p>
            </div>
            <Tabs defaultActiveKey="1" items={items} />
        </>

    );
}
